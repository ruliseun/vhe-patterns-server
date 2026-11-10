// eslint-disable no-case-declarations
import otpGenerator from "otp-generator";
import Logger from "../../utils/logger";
import EmailService from "../email/email.service";
import { appRoot } from "../../app";
import ejs from "ejs";
import { frontendBaseUrl } from "../../config/env";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";
import { User } from "../../entity/User";
import { OTPVerificationModel } from "../../audit/otp.model";
import { login } from "../auth.service";
import { IUser } from "../../interface/user.interface";
import { UserStatusEnum } from "../../enums/user-type.enum";

async function generateVerificationOTP(): Promise<string> {
  try {
    return otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
  } catch (error) {
    Logger.error("Error generating OTP", error);
    throw error;
  }
}
/* eslint-disable complexity */
async function sendOTP(
  receiverEmail: string,
  code: string,
  type: "password_reset" | "email_verification" | "email_otp" | "request_otp",
  data?: { [key: string]: string | undefined },
): Promise<void> {
  let emailTemplate = "";

  const orgName = data?.orgName;
  const orgAddress = data?.organisationAddress;

  /* eslint-disable no-case-declarations */
  switch (type) {
    case "password_reset":
      const resetPasswordTemplatePath = "/templates/reset-password.ejs";
      const token = btoa(receiverEmail);
      emailTemplate = await ejs.renderFile(`${appRoot}${resetPasswordTemplatePath}`, {
        otp: code,
        reset_password_url: `${frontendBaseUrl}/forgot-password?token=${token}`,
        organisationName: orgName || "",
        organisationAddress: orgAddress || "",
      });
      break;
    case "email_verification":
      const emailVerificationTemplatePath = "/templates/verify-email.ejs";
      emailTemplate = await ejs.renderFile(`${appRoot}${emailVerificationTemplatePath}`, {
        verification_link: data?.link,
        user_name: data?.name,
        organisationName: data?.orgName || "",
        organisationAddress: data?.organisationAddress || "",
      });
      break;
    case "request_otp":
      const requestOTPTemplatePath = "/templates/otp-request.ejs";
      emailTemplate = await ejs.renderFile(`${appRoot}${requestOTPTemplatePath}`, {
        otp: code,
        organisationName: data?.orgName || "",
        organisationAddress: data?.organisationAddress || "",
      });
      break;
  }

  try {
    await EmailService.sendMail({
      receiverEmail,
      subject:
        type === "email_otp"
          ? "OTP VERIFICATION"
          : type === "email_verification"
            ? "Verify your Email"
            : type === "request_otp"
              ? `OTP for ${receiverEmail}`
              : "Action Required!",
      text: "Message Alert!",
      html: emailTemplate,
      sender: data?.orgEmail ? data.orgEmail : undefined,
      senderName: data?.orgName ? data.orgName : undefined,
    });
    return;
  } catch (error) {
    Logger.error("error sending email", error);
  }
}

async function hasOTPExpired(date: Date): Promise<boolean> {
  const now = new Date();
  const resetDate = date;

  const differenceInMilliseconds = now.getTime() - resetDate.getTime();

  const fiveMinutesInMilliseconds = 5 * 60 * 1000;

  return differenceInMilliseconds > fiveMinutesInMilliseconds;
}

async function requestOTP(data: { [key: string]: unknown }) {
  const { email, requestId } = data;

  const validateUser = await ABSTRACT_SERVICE.getUniqueData(User, { email });

  if (!validateUser) {
    const error = new Error("Invalid user credential");
    (error as any).httpStatusCode = 400;
    throw error;
  }

  let token: any = null;
  let otp: string;

  const isTestMode = email === (process.env.TEST_MODE_EMAIL || "vhepatterns@info.com");

  if (isTestMode) {
    let testModeRecord = await OTPVerificationModel.findOne({
      email,
      isTestMode: true,
    });

    if (!testModeRecord) {
      const testModeRequestId = otpGenerator.generate(10, {
        upperCaseAlphabets: true,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      const testModeOTP = process.env.TEST_MODE_OTP || "123456";

      testModeRecord = await OTPVerificationModel.create({
        requestId: testModeRequestId,
        otp: testModeOTP,
        email,
        isTestMode: true,
        expiresAt: null,
      });
    }

    return { requestId: testModeRecord.requestId };
  }

  if (requestId) {
    const existingRecord = await OTPVerificationModel.findOne({ requestId });
    if (existingRecord) {
      otp = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
      existingRecord.otp = otp;
      existingRecord.isValid = true;
      await existingRecord.save();
      token = existingRecord;
    } else {
      const error = new Error("Invalid request ID");
      (error as any).httpStatusCode = 400;
      throw error;
    }
  } else {
    const existingRecord = await OTPVerificationModel.findOne({ email });
    if (existingRecord) {
      const error = new Error("OTP has already been sent. Please use the existing request ID.");
      (error as any).httpStatusCode = 400;
      throw error;
    }

    const newRequestId = otpGenerator.generate(10, {
      upperCaseAlphabets: true,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const newToken = await OTPVerificationModel.create({
      requestId: newRequestId,
      otp,
      email,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    if (!newToken) {
      const error = new Error("Error generating OTP");
      (error as any).httpStatusCode = 400;
      throw error;
    }
    token = newToken.toObject();
  }

  if (token) {
    await sendOTP(email as string, otp, "request_otp", {
      orgEmail: undefined,
      orgName: undefined,
      organisationAddress: undefined,
    });
  }

  return { requestId: token.requestId };
}

async function validateOTP(data: { [key: string]: unknown }, userAgent: string) {
  const { otp, requestId, auth = false } = data;

  const otpRecord = await OTPVerificationModel.findOne({ otp, requestId });

  if (!otpRecord || !otpRecord.isValid) {
    throw createError("Invalid OTP", 400);
  }

  const validity = otpRecord.isTestMode ? true : false;

  await OTPVerificationModel.findByIdAndUpdate(otpRecord._id, { $set: { isValid: validity } }, { new: true });

  if (auth) {
    const getUser = (await ABSTRACT_SERVICE.getUniqueData(User, { email: otpRecord.email })) as Partial<IUser>;
    const [loginUser] = await Promise.all([
      login(getUser, userAgent, "APP"),
      ABSTRACT_SERVICE.updateByEntry(
        User,
        { id: getUser.id },
        { lastLogin: new Date(), status: UserStatusEnum.ACTIVE },
      ),
    ]);
    const { user, ...userDetails } = loginUser as unknown as Partial<IUser>;

    return {
      ...userDetails,
      requestId: otpRecord.requestId,
      otpType: "Email",
      user: {
        ...user,
        id: undefined,
        password: undefined,
        password_reset: undefined,
        deviceType: "APP",
      },
    };
  }

  return { requestId: otpRecord.requestId, otpType: "Email", email: otpRecord.email };
}

const OTPService = { generateVerificationOTP, sendOTP, hasOTPExpired, requestOTP, validateOTP };

export default OTPService;
