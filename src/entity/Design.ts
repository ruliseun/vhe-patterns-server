import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { DesignFlagEnum, DesignStatusEnum } from "../enums/design.enum";
import { Category } from "./Category";

@Entity()
export class Design {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text", unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text" })
  mainImage: string;

  @Column({ type: "jsonb", nullable: true })
  colorVariations: string[];

  @Column({ type: "int" })
  exclusivePrice: number;

  @Column({ type: "int" })
  nonExclusivePrice: number;

  @Column({ type: "int", nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.designs, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Column({
    type: "text",
    enum: DesignStatusEnum,
    default: DesignStatusEnum.ACTIVE,
  })
  status: DesignStatusEnum;

  @Column({
    type: "text",
    enum: DesignFlagEnum,
    default: DesignFlagEnum.RECENT,
    nullable: true,
  })
  flag: DesignFlagEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
