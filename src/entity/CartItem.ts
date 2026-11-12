import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { CartLicenseEnum } from "../enums/cart.enum";
import { Cart } from "./Cart";
import { Design } from "./Design";

@Entity("cart_item")
@Unique(["cartId", "designId", "license", "colorChanges"])
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  cartId: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cartId" })
  cart: Cart;

  @Column({ type: "int" })
  designId: number;

  @ManyToOne(() => Design, { onDelete: "CASCADE" })
  @JoinColumn({ name: "designId" })
  design: Design;

  @Column({ type: "text" })
  license: CartLicenseEnum;

  @Column({ type: "int", default: 0 })
  colorChanges: number;

  @Column({ type: "int" })
  unitPrice: number;

  @Column({ type: "int", default: 0 })
  colorChangeFee: number;

  @Column({ type: "boolean", default: true })
  selected: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
