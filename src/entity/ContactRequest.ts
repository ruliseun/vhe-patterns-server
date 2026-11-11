import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ContactStatusEnum } from "../enums/contact.enum";

@Entity({ name: "contact_request" })
export class ContactRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  firstName: string;

  @Column({ type: "text" })
  lastName: string;

  @Column({ type: "text" })
  email: string;

  @Column({ type: "text", nullable: true })
  phone: string;

  @Column({ type: "text", nullable: true })
  company: string;

  @Column({ type: "text", nullable: true })
  brand: string;

  @Column({ type: "text", nullable: true })
  message: string;

  @Column({
    type: "text",
    enum: ContactStatusEnum,
    default: ContactStatusEnum.PENDING,
  })
  status: ContactStatusEnum;

  @Column({ type: "text", nullable: true })
  reply: string;

  @Column({ type: "timestamp", nullable: true })
  repliedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
