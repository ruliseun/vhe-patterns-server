import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Admin } from "./Admin";
import { AdminActivityStatus, AdminActivityType } from "../enums/admin-activity.enum";

@Entity()
@Index(["adminId", "createdAt"])
@Index(["activityType", "createdAt"])
export class AdminActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  adminId: number;

  @ManyToOne(() => Admin, { onDelete: "CASCADE" })
  @JoinColumn({ name: "adminId" })
  admin: Admin;

  @Column({
    type: "text",
    enum: AdminActivityType,
  })
  activityType: AdminActivityType;

  @Column({
    type: "text",
    enum: AdminActivityStatus,
    default: AdminActivityStatus.SUCCESS,
  })
  status: AdminActivityStatus;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    resourceType?: string;
    resourceId?: number | string;
    resourceName?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    errorMessage?: string;
    errorCode?: string;
    [key: string]: any;
  };

  @Column({ type: "text", nullable: true })
  ipAddress: string;

  @Column({ type: "text", nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
