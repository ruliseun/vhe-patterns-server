import { CartLicenseEnum } from "../enums/cart.enum";

export interface IAddCartItem {
  designId: number;
  license: CartLicenseEnum;
  colorChanges: number;
}

export interface ICartSelection {
  selected: boolean;
}
