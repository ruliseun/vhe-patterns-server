import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Cart } from "./Cart";

@Entity("guest_session")
export class GuestSession {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @OneToMany(() => Cart, (cart) => cart.guestSession)
  carts: Cart[];

  @Column({ type: "timestamp", nullable: true })
  lastActiveAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
