import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { NewsletterStatusEnum } from "../enums/newsletter.enum";

@Entity("newsletter_subscriber")
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text", default: NewsletterStatusEnum.ACTIVE })
  status: NewsletterStatusEnum;

  @Column({ type: "timestamp", nullable: true })
  statusUpdatedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
