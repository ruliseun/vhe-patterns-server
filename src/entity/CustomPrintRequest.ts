import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CustomPrintStatusEnum } from "../enums/custom-print.enum";

@Entity({ name: "custom_print_request" })
export class CustomPrintRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  firstName: string;

  @Column({ type: "text" })
  lastName: string;

  @Column({ type: "text", nullable: true })
  brand: string;

  @Column({ type: "text" })
  email: string;

  @Column({ type: "text" })
  phone: string;

  @Column({ type: "text", nullable: true })
  altPhone: string;

  @Column({ type: "text" })
  service: string;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text", nullable: true })
  references: string;

  @Column({ type: "jsonb", nullable: true })
  images: string[];

  @Column({ type: "text" })
  timeline: string;

  @Column({ type: "text", nullable: true })
  fabric: string;

  @Column({ type: "text", nullable: true })
  budget: string;

  @Column({ type: "text", nullable: true })
  message: string;

  @Column({
    type: "text",
    enum: CustomPrintStatusEnum,
    default: CustomPrintStatusEnum.PENDING,
  })
  status: CustomPrintStatusEnum;

  @Column({ type: "timestamp", nullable: true })
  statusUpdatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
