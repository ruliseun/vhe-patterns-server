import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BrandStatusEnum } from "../enums/brand.enum";

@Entity()
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  excerpt: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text" })
  mainImage: string;

  @Column({ type: "jsonb", nullable: true })
  gallery: string[];

  @Column({
    type: "text",
    enum: BrandStatusEnum,
    default: BrandStatusEnum.ACTIVE,
  })
  status: BrandStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
