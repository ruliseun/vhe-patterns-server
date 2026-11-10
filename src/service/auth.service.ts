/* eslint-disable complexity */
import { Response } from "express";
import { comparePassword, harshPassword, passwordStrength } from "../config/constants";
import { baseApiURL, frontendBaseUrl } from "../config/env";
import { Role } from "../entity/Role";
import { User } from "../entity/User";
import { VerificationsModel } from "../entity/Verifications";
import { ProfileTypeEnum, UserStatusEnum, VerificationTypeEnum } from "../enums/user-type.enum";
import { ILogin, IUser, ProfileStatus } from "../interface/user.interface";
import ABSTRACT_SERVICE, { createError } from "./abstractService/abstractService";
import OTPService from "./otp/otp.service";
import TokenService from "./token.service";
import Logger from "../utils/logger";
import { appRoot } from "../app";
import ejs from "ejs";
import EmailService from "./email/email.service";
import { toSentenceCase } from "../utils/formater";
import countries from "../config/constants/countries";
import { ADMIN_MODEL, USER_MODEL } from "../config/database/db";
import { ResponseCodeEnum } from "../enums/response-codes.enum";
import { Admin } from "../entity/Admin";

async function createUser(data: IUser) {
  const { country, phone, email, ...userData } = data;

  if (!email) {
    throw createError("Email is required", ResponseCodeEnum.BAD_REQUEST);
  }

  if (!userData.password) {
    throw createError("Password is required", ResponseCodeEnum.BAD_REQUEST);
  }

  if (country) {
    const validateCountry = countries.find((cty) => cty.name.toLowerCase() === country.toLowerCase());
    if (!validateCountry) {
      const error = new Error("Invalid country");
      (error as any).httpStatusCode = 400;
      throw error;
    }
  }

  const uniqueUserQuery = { where: [{ email }] };
  const userExist = await ABSTRACT_SERVICE.getAllData(User, uniqueUserQuery);
  if (userExist?.length) {
    throw createError("User with record already exist", ResponseCodeEnum.BAD_REQUEST);
  }

  const validatePasswordStrength = await passwordStrength(userData.password);
  if (!validatePasswordStrength) {
    const error = new Error("Password is too weak");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  const hashPassword = await harshPassword(userData.password);

  const getRole = await ABSTRACT_SERVICE.getUniqueData(Role, { name: ProfileTypeEnum.MEMBER });
  if (!getRole) {
    const error = new Error("Error setting user role");
    (error as any).httpStatusCode = 500;
    throw error;
  }

  const createdUser = await ABSTRACT_SERVICE.createData(User, {
    firstName: toSentenceCase(userData.firstName),
    middleName: userData.middleName,
    lastName: toSentenceCase(userData.lastName),
    password: hashPassword,
    role: getRole,
    email,
    country: country ? country : null,
    userAgent: userData.userAgent,
    profileType: getRole.name,
    status: UserStatusEnum.INACTIVE,
    address: userData.address ?? null,
    dob: userData.dob ?? null,
    gender: userData.gender ?? null,
    ageRange: userData.ageRange ?? null,
    maritalStatus: userData.maritalStatus ?? null,
    phone: phone ?? null,
    consent: userData.consent ?? false,
    guardianSupervisionConsent: userData.guardianSupervisionConsent ?? false,
    guardianSupervisionConsentDate: userData.guardianSupervisionConsent ? new Date() : null,
  });

  if (!createdUser) {
    const error = new Error("Error creating user");
    (error as any).httpStatusCode = 500;
    throw error;
  }

  try {
    sendVerificationEmail({ email, name: userData.firstName as string });
  } catch (error) {
    console.error("Error sending verification email:::", error);
    Logger.error("Error sending verification email:::", error);
  }

  const { id, password, password_reset, ...rest } = createdUser;
  return rest;
}

async function resendVerificationEmailToken(token: string, res: Response) {
  try {
    const decodeEmail = atob(token);

    const getUser = await ABSTRACT_SERVICE.getUniqueData(User, { email: decodeEmail });
    if (!getUser) {
      const error = new Error("User not found");
      (error as any).httpStatusCode = 404;
      throw error;
    }

    if (getUser.status === ProfileStatus.ACTIVE) {
      const error = new Error("Email has been verified");
      (error as any).httpStatusCode = 400;
      throw error;
    }

    if (getUser.status === ProfileStatus.ARCHIVED || getUser.status === ProfileStatus.MOVED) {
      const error = new Error("User Profile is archived or moved");
      (error as any).httpStatusCode = 400;
      throw error;
    }

    await sendVerificationEmail({ email: getUser.email, name: getUser.firstName });

    const verificationPage = "/templates/email-verification-resent.ejs";
    const renderPage = await ejs.renderFile(`${appRoot}${verificationPage}`);
    return res.send(renderPage);
  } catch (ex) {
    Logger.error("Error resending verification email:::", ex);
    const errorTemplate = "/templates/resend-verification-error.ejs";
    const renderPage = await ejs.renderFile(`${appRoot}${errorTemplate}`);
    return res.send(renderPage);
  }
}

async function loginUser(data: ILogin, isAdminUser = false) {
  let { email, password, deviceType = "WEB", userAgent } = data;
  email = email.toLowerCase().trim();

  let getUser = null;

  getUser = !isAdminUser
    ? await ABSTRACT_SERVICE.findAndPopulate(User, { email }, ["role", "permissions"])
    : await ABSTRACT_SERVICE.findAndPopulate(Admin, { email }, ["role", "permissions"]);

  if (!getUser) {
    throw createError("Invalid login credential", ResponseCodeEnum.UNAUTHORIZED);
  }

  if (!getUser.password) {
    const error = new Error("Password reset is required");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  if (getUser.status == ProfileStatus.ARCHIVED) {
    return { error: "User Profile is archived", status: 88 };
  }

  if (getUser.status !== ProfileStatus.ACTIVE) {
    return { error: "User Profile is not active", status: 99 };
  }

  const validatePassword = await comparePassword(password, getUser.password);

  if (!validatePassword) {
    const error = new Error("Invalid login credential");
    (error as any).httpStatusCode = 401;
    throw error;
  }

  const loginResponse = await login(getUser, userAgent, deviceType);
  getUser.lastLogin = new Date();

  if (!isAdminUser) {
    await USER_MODEL.save(getUser);
  } else {
    await ADMIN_MODEL.save(getUser);
  }

  const { user, ...userDetails } = loginResponse as unknown as Partial<IUser>;

  return {
    ...userDetails,
    user: {
      ...user,
      password: undefined,
      password_reset: undefined,
      deviceType,
    },
  };
}

async function forgotPasswordRequest(data: { [key: string]: string }, isAdminUser = false) {
  const { email } = data;

  let entity: unknown = User;

  if (isAdminUser) entity = Admin;

  const getUser = await ABSTRACT_SERVICE.getUniqueData(entity, { email });

  if (!getUser) {
    const error = new Error("Account with associated email not found");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  const reset_otp = await OTPService.generateVerificationOTP();

  data = { ...data, orgName: "", organisationAddress: "" };

  const updates = {
    password_reset: {
      initiated: true,
      otp: reset_otp,
      date: new Date(),
    },
  };

  const updateModel = await ABSTRACT_SERVICE.updateById(entity, getUser.id, updates);

  if (!updateModel.affected) {
    const error = new Error("Error sending OTP");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  return await OTPService.sendOTP(email, reset_otp, "password_reset", data);
}

async function resetPassword(data: { [key: string]: string }, isAdminUser = false) {
  const { email, code, password } = data;

  let entity: unknown = User;

  if (isAdminUser) entity = Admin;

  const getUser = await ABSTRACT_SERVICE.getUniqueData(entity, { email });

  if (!getUser) {
    const error = new Error("Account with associated email not found");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  if (getUser.password_reset && getUser.password_reset.initiated) {
    const resetDate = new Date(getUser.password_reset.date);
    const OTPExpired = await OTPService.hasOTPExpired(resetDate);

    if (OTPExpired) {
      const error = new Error("OTP has expired");
      (error as any).httpStatusCode = 400;
      throw error;
    }

    if (getUser.password_reset.otp !== code) {
      const error = new Error("Invalid OTP");
      (error as any).httpStatusCode = 400;
      throw error;
    }
  }

  const validatePasswordStrength = await passwordStrength(password);

  if (!validatePasswordStrength) {
    const error = new Error("Password is too weak");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  const harshedPassword = await harshPassword(password);

  const updateRecord = await ABSTRACT_SERVICE.updateById(entity, getUser.id, {
    password: harshedPassword,
    status: UserStatusEnum.ACTIVE,
    password_reset: { initiated: null, otp: null, date: null },
  });

  if (!updateRecord.affected) {
    const error = new Error("Error updating password");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  return;
}

export async function sendVerificationEmail(data: { [key: string]: string }) {
  const { email, name } = data;

  const verifyProfile = await ABSTRACT_SERVICE.getUniqueData(User, { email });

  if (verifyProfile && verifyProfile.status === UserStatusEnum.ACTIVE) {
    const error = new Error("Email has been verified");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  if (
    (verifyProfile && verifyProfile.status === UserStatusEnum.MOVED) ||
    (verifyProfile && verifyProfile.status === UserStatusEnum.ARCHIVED)
  ) {
    const error = new Error("Profile has been moved or archived, contact admin");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  const encodeEmail = btoa(email);
  const verificationLink = `${baseApiURL}/auth/verify/${encodeEmail}`;

  const emailData = {
    name,
    link: verificationLink,
    orgEmail: undefined,
    orgName: undefined,
    organisationAddress: undefined,
  };

  const recordExist = await VerificationsModel.findOne({ email, type: "EMAIL" });

  if (recordExist) {
    await VerificationsModel.findByIdAndUpdate(recordExist._id, { $set: { link: verificationLink, is_valid: true } });
  } else {
    await VerificationsModel.create({
      email,
      type: VerificationTypeEnum.EMAIL,
      code: verificationLink,
    });
  }

  await OTPService.sendOTP(email, "", "email_verification", emailData);

  return;
}

export async function restoreUserVerification(data: { [key: string]: string }) {
  const { email, name, orgEmail, orgName, orgAddress } = data;

  const encodeEmail = btoa(email);
  const verificationLink = `${baseApiURL}/auth/verify/${encodeEmail}`;

  const recordExist = await VerificationsModel.findOne({ email, type: "EMAIL" });

  if (recordExist) {
    await VerificationsModel.findByIdAndUpdate(recordExist._id, { $set: { link: verificationLink, is_valid: true } });
  } else {
    await VerificationsModel.create({
      email,
      type: VerificationTypeEnum.EMAIL,
      code: verificationLink,
    });
  }

  const emailVerificationTemplatePath = "/templates/user-restored.ejs";
  const emailTemplate = await ejs.renderFile(`${appRoot}${emailVerificationTemplatePath}`, {
    organisationName: orgName,
    organisationAddress: orgAddress,
    user_name: name,
    verification_link: verificationLink,
  });

  await EmailService.sendMail({
    receiverEmail: email,
    subject: "Account Restored",
    text: "Your account has been restored",
    html: emailTemplate,
    sender: orgEmail,
    senderName: orgName,
  });

  return;
}

async function verifyProfileEmail(data: string, res: Response) {
  const decodedEmail = atob(data);

  const verifyUser = await VerificationsModel.findOne({
    email: decodedEmail,
    is_valid: true,
    type: VerificationTypeEnum.EMAIL,
  });

  if (!verifyUser) {
    const verificationExpiredPage = "/templates/email-verification-expired.ejs";
    const renderPage = await ejs.renderFile(`${appRoot}${verificationExpiredPage}`, {
      resendLink: `${baseApiURL}/auth/resend_verification/${data}`,
    });
    return res.send(renderPage);
  }

  await ABSTRACT_SERVICE.updateByEntry(User, { email: decodedEmail }, { status: UserStatusEnum.ACTIVE });

  await VerificationsModel.findByIdAndUpdate(verifyUser._id, { $set: { is_valid: false } });

  const verificationPage = "/templates/email-verification-success.ejs";
  const renderPage = await ejs.renderFile(`${appRoot}${verificationPage}`, { loginUrl: `${frontendBaseUrl}/login` });
  return res.send(renderPage);
}

export const login = async (user: Partial<IUser>, userAgent: string, deviceType: string) => {
  const refreshTokenPromise = TokenService.generateRefreshToken(user, userAgent, deviceType);
  const [refreshToken, { jwtid }] = await Promise.all([
    refreshTokenPromise,
    refreshTokenPromise.then(TokenService.decodeRefreshToken),
  ]);

  // const refreshToken = await TokenService.generateRefreshToken(user, userAgent, deviceType);
  // const { jwtid } = await TokenService.decodeRefreshToken(refreshToken);

  const { accessToken, expiresIn } = await TokenService.generateAccessToken(user, jwtid, deviceType);

  return buildResponse({ accessToken, refreshToken, expiresIn, user });
};

const refresh = async (refreshToken: string, deviceType: string) => {
  const data = (await TokenService.generateAccessTokenFromRefreshToken(refreshToken, deviceType)) as {
    accessToken: string;
    expiresIn: number;
  };

  return buildResponse({ accessToken: data.accessToken, expiresIn: data.expiresIn });
};

const logout = async (user: string, deviceType: string) => {
  return await TokenService.deleteRefreshToken(user, deviceType);
};

const buildResponse = ({
  accessToken,
  refreshToken,
  expiresIn,
  user,
}: {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number | null;
  user?: Partial<IUser>;
}) => {
  return {
    accessToken,
    refreshToken,
    expiresIn,
    ...(user && { user }),
  };
};

const AuthService = {
  login,
  refresh,
  logout,
  createUser,
  loginUser,
  forgotPasswordRequest,
  resetPassword,
  sendVerificationEmail,
  verifyProfileEmail,
  resendVerificationEmailToken,
};

export default AuthService;
