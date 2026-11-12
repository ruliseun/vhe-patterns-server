import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PromoBarStatusEnum } from "../enums/promo-bar.enum";

@Entity("promo_bar")
export class PromoBar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text",
    enum: PromoBarStatusEnum,
    default: PromoBarStatusEnum.INACTIVE,
  })
  status: PromoBarStatusEnum;

  @Column({ type: "text", nullable: true })
  message: string;

  @Column({ type: "timestamp", nullable: true })
  statusUpdatedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
