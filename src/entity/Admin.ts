import { GenderEnum, ProfileTypeEnum, UserStatusEnum } from "../enums/user-type.enum";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "./Role";
import { UserPermission } from "./UserPermissions";

@Entity()
@Unique(["email"])
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  firstName: string;

  @Column({ type: "text", nullable: true })
  middleName: string;

  @Column({ type: "text", nullable: true })
  lastName: string;

  @Column({ type: "int", nullable: true })
  roleId: number;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text", enum: GenderEnum, nullable: true })
  gender: GenderEnum;

  @Column({ type: "text", nullable: true })
  phone: string;

  @Column({ type: "text", nullable: true })
  country: string;

  @Column({ type: "text", nullable: true })
  state: string;

  @Column({ type: "text", nullable: true })
  city: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({
    type: "text",
    enum: ProfileTypeEnum,
    default: ProfileTypeEnum.SUPER_ADMIN,
  })
  profileType: ProfileTypeEnum;

  @Column({
    type: "text",
    enum: UserStatusEnum,
    default: UserStatusEnum.INACTIVE,
  })
  status: UserStatusEnum;

  @Column({ type: "text", nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "text", nullable: true })
  password: string;

  @Column({ type: "jsonb", nullable: true })
  password_reset: {
    initiated: boolean;
    otp: string;
    date: Date;
  };

  @Column({ type: "timestamp", nullable: true })
  lastLogin: Date;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: "roleId" })
  role: Role;

  @OneToMany(() => UserPermission, (userPermission) => userPermission.user)
  permissions: UserPermission[];
}
