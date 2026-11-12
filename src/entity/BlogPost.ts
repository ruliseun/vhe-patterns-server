import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BlogStatusEnum } from "../enums/blog.enum";

@Entity("blog_post")
export class BlogPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text", unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  excerpt?: string;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "text" })
  mainImage: string;

  @Column({ type: "text", default: BlogStatusEnum.ACTIVE })
  status: BlogStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
