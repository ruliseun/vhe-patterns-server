import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CartStatusEnum } from "../enums/cart.enum";
import { CartItem } from "./CartItem";
import { GuestSession } from "./GuestSession";

@Entity("cart")
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid" })
  guestSessionId: string;

  @ManyToOne(() => GuestSession, (guestSession) => guestSession.carts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "guestSessionId" })
  guestSession: GuestSession;

  @Column({
    type: "text",
    enum: CartStatusEnum,
    default: CartStatusEnum.ACTIVE,
  })
  status: CartStatusEnum;

  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
