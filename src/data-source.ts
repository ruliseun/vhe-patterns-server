import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Role } from "./entity/Role";
import { Permission } from "./entity/Permission";
import { RefreshToken } from "./entity/Token";
import {
  databaseHost,
  databaseName,
  databasePassword,
  databasePort,
  databaseUser,
  localDatabasePassword,
  localDatabaseUserName,
  nodeEnv,
} from "./config/env";
import { Environments } from "./enums/env.enum";
import { UserPermission } from "./entity/UserPermissions";
import { Admin } from "./entity/Admin";
import { AdminActivityLog } from "./entity/AdminActivityLog";
import { Design } from "./entity/Design";
import { Category } from "./entity/Category";
import { Brand } from "./entity/Brand";
import { ContactRequest } from "./entity/ContactRequest";
import { CustomPrintRequest } from "./entity/CustomPrintRequest";
import { NewsletterSubscriber } from "./entity/NewsletterSubscriber";
import { BlogPost } from "./entity/BlogPost";
import { GuestSession } from "./entity/GuestSession";
import { Cart } from "./entity/Cart";
import { CartItem } from "./entity/CartItem";
import { PromoBar } from "./entity/PromoBar";

interface IDbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

const dbEntities = [
  User,
  Role,
  Permission,
  RefreshToken,
  UserPermission,
  Admin,
  AdminActivityLog,
  Design,
  Category,
  Brand,
  ContactRequest,
  CustomPrintRequest,
  NewsletterSubscriber,
  BlogPost,
  GuestSession,
  Cart,
  CartItem,
  PromoBar,
];

let dbConfig: IDbConfig = {} as IDbConfig;

switch (nodeEnv) {
  case Environments.DEVELOPMENT:
  case Environments.PRODUCTION:
    dbConfig.host = databaseHost!;
    dbConfig.port = +databasePort!;
    dbConfig.username = databaseUser!;
    dbConfig.password = databasePassword!;
    dbConfig.database = databaseName!;
    break;
  default:
    dbConfig.host = "localhost";
    dbConfig.port = 5432;
    dbConfig.username = localDatabaseUserName!;
    dbConfig.password = localDatabasePassword!;
    dbConfig.database = "vhe_patterns_local";
    break;
}

export const AppDataSource = new DataSource({
  type: "postgres",
  ...dbConfig,
  logging: false,
  entities: dbEntities,
  dropSchema: false,
  synchronize: false,
  migrations: nodeEnv === Environments.LOCAL ? ["dist/migration/**/*.js"] : ["dist/migration/**/*.js"],
  subscribers: nodeEnv === Environments.LOCAL ? ["src/subscriber/**/*.js"] : ["dist/subscriber/**/*.js"],
  migrationsRun: false,
});
