import { AppDataSource } from "../../data-source";
import { Permission } from "../../entity/Permission";
import { Role } from "../../entity/Role";
import { RefreshToken } from "../../entity/Token";
import { User } from "../../entity/User";
import { UserPermission } from "../../entity/UserPermissions";
import { Admin } from "../../entity/Admin";
import { AdminActivityLog } from "../../entity/AdminActivityLog";

export const USER_MODEL = AppDataSource.getRepository(User);
export const ROLE_MODEL = AppDataSource.getRepository(Role);
export const PERMISSION_MODEL = AppDataSource.getRepository(Permission);
export const REFRESH_TOKEN_MODEL = AppDataSource.getRepository(RefreshToken);
export const USER_PERMISSION_MODEL = AppDataSource.getRepository(UserPermission);
export const ADMIN_MODEL = AppDataSource.getRepository(Admin);
export const ADMIN_ACTIVITY_LOG_MODEL = AppDataSource.getRepository(AdminActivityLog);
