import { PromoBarStatusEnum } from "../enums/promo-bar.enum";

export interface IUpdatePromoBar {
  status?: PromoBarStatusEnum;
  message?: string;
}
