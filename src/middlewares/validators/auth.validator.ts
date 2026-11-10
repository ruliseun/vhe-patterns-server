import { check } from "express-validator";
import { passwordStrength } from "../../config/constants";
import { DeviceTypeEnum, GenderEnum } from "../../enums/user-type.enum";
import EnumUtils from "../../utils/enum.utils";

export const validateLogin = [
  check("email")
    .exists()
    .withMessage("Email is required")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email address"),
  check("password").exists().withMessage("Password is required").notEmpty().withMessage("Password cannot be empty"),
  check("deviceType")
    .optional()
    .isString()
    .withMessage("Device type must be a string")
    .toUpperCase()
    .isIn(["WEB", "APP"])
    .trim(),
];

export const validateLogout = [
  check("deviceType")
    .optional()
    .isString()
    .withMessage("Device type must be a string")
    .toUpperCase()
    .isIn([DeviceTypeEnum.WEB, DeviceTypeEnum.APP])
    .trim(),
];

export const validateCreateUser = [
  check("firstName")
    .exists()
    .withMessage("First Name is required")
    .notEmpty()
    .withMessage("First Name cannot be empty")
    .isString()
    .withMessage("First Name must be a string")
    .trim(),

  check("middleName")
    .optional()
    .notEmpty()
    .withMessage("Middle Name cannot be empty")
    .isString()
    .withMessage("Middle Name must be a string")
    .trim(),

  check("lastName")
    .exists()
    .withMessage("Last Name is required")
    .notEmpty()
    .withMessage("Last Name cannot be empty")
    .isString()
    .withMessage("Last Name must be a string")
    .trim(),

  check("email")
    .exists()
    .withMessage("Email is required")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email format")
    .toLowerCase()
    .trim(),

  check("phone")
    .optional()
    .notEmpty()
    .withMessage("Phone number cannot be empty")
    .isString()
    .withMessage("Phone number must be a string")
    .trim(),

  check("country")
    .optional()
    .notEmpty()
    .withMessage("Country cannot be empty")
    .isString()
    .withMessage("Country must be a string")
    .trim(),

  check("state")
    .optional()
    .notEmpty()
    .withMessage("State cannot be empty")
    .isString()
    .withMessage("State must be a string")
    .trim(),

  check("city")
    .optional()
    .notEmpty()
    .withMessage("City cannot be empty")
    .isString()
    .withMessage("City must be a string")
    .trim(),

  check("address")
    .optional()
    .notEmpty()
    .withMessage("Address cannot be empty")
    .isString()
    .withMessage("Address must be a string")
    .trim(),

  check("dob")
    .optional()
    .notEmpty()
    .withMessage("Date of birth cannot be empty")
    .isString()
    .withMessage("Date of birth must be a string")
    .matches(/^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])$/)
    .withMessage("Invalid format. Use DD-MM")
    .trim(),

  check("password")
    .optional()
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isString()
    .withMessage("Password must be a string")
    .custom(async (value) => {
      const validPassword = await passwordStrength(value);
      if (!validPassword) {
        throw new Error(
          "Password must contain atleast 8 characters including one uppercase letter, one lower case letter, one number and one character",
        );
      }
      return true;
    })
    .trim(),

  check("gender")
    .optional()
    .notEmpty()
    .withMessage("Gender cannot be empty")
    .isString()
    .withMessage("Gender must be a string")
    .toUpperCase()
    .isIn(EnumUtils.extractEnumValues(GenderEnum))
    .withMessage(
      "Invalid gender, please select one of the following: " + EnumUtils.extractEnumValues(GenderEnum).join(", "),
    )
    .trim(),
];

export const refeshTokenValidator = [
  check("token").exists().withMessage("Token is required").isString().withMessage("Invalid JWT token").trim(),
];

export const verifyEmailTokenValidator = [
  check("token").exists().withMessage("Email token is required").isString().withMessage("Invalid email token"),
];

export const validateEmail = [
  check("email")
    .exists()
    .withMessage("Email is required")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .custom((value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (Array.isArray(value)) {
        const invalidEmails = value.filter((email: string) => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
          throw new Error(`Invalid email addresses: ${invalidEmails.join(", ")}`);
        }
        return true;
      }

      if (!emailRegex.test(value)) {
        throw new Error("Invalid email format");
      }

      return true;
    }),
];

export const validateResetPassword = [
  check("code")
    .exists()
    .withMessage("Code is required")
    .notEmpty()
    .withMessage("Code cannot be empty")
    .isString()
    .withMessage("Code must be string")
    .trim(),
  check("password")
    .exists()
    .withMessage("Password is required")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isString()
    .withMessage("Password must be a string")
    .custom(async (value) => {
      const validPassword = await passwordStrength(value);
      if (!validPassword) {
        throw new Error(
          "Password must contain atleast 8 characters including one uppercase letter, one lower case letter, one number and one character",
        );
      }
      return true;
    })
    .trim(),
];

export const requestOTPValidator = [
  check("email")
    .exists()
    .withMessage("Email is required")
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email"),

  check("requestId")
    .optional()
    .notEmpty()
    .withMessage("requestId cannot be empty")
    .isString()
    .withMessage("requestId must be a string")
    .trim(),
];

export const validateOTPValidator = [
  check("otp")
    .exists()
    .withMessage("otp is required")
    .notEmpty()
    .withMessage("otp cannot be empty")
    .isString()
    .withMessage("otp must be a string")
    .trim(),

  check("requestId")
    .exists()
    .withMessage("requestId is required")
    .notEmpty()
    .withMessage("requestId cannot be empty")
    .isString()
    .withMessage("requestId must be a string")
    .trim(),

  check("auth")
    .optional()
    .notEmpty()
    .withMessage("Auth cannot be empty")
    .isBoolean()
    .withMessage("Auth must be boolean"),
];
