import { GenderEnum, ProfileTypeEnum, UserStatusEnum } from "../enums/user-type.enum";

export interface IAdminUser {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender?: GenderEnum;
  profileType: ProfileTypeEnum.SUPER_ADMIN;
  status: UserStatusEnum;
  userAgent: string;
  createdAt?: Date;
  updatedAt?: Date;
  password: string;
  [x: string]: any;
}
