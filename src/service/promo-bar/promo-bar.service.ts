import { AppDataSource } from "../../data-source";
import { PromoBar } from "../../entity/PromoBar";
import { PromoBarStatusEnum } from "../../enums/promo-bar.enum";
import { IUpdatePromoBar } from "../../interface/promo-bar.interface";
import ABSTRACT_SERVICE from "../abstractService/abstractService";

// The promo bar is a single global record — the first row is the source of truth.
async function getPromoBar() {
  const repository = AppDataSource.getRepository(PromoBar);
  const existing = await repository.findOne({ where: {}, order: { id: "ASC" } });
  if (existing) return existing;

  return (await ABSTRACT_SERVICE.createData(PromoBar, {
    status: PromoBarStatusEnum.INACTIVE,
  })) as PromoBar;
}

async function updatePromoBar({ status, message }: IUpdatePromoBar) {
  const promoBar = await getPromoBar();

  const update: { [key: string]: unknown } = {};
  if (message !== undefined) update.message = message;
  if (status !== undefined && status !== promoBar.status) {
    update.status = status;
    update.statusUpdatedAt = new Date();
  }

  if (Object.keys(update).length) {
    await ABSTRACT_SERVICE.updateById(PromoBar, promoBar.id, update);
  }

  return await getPromoBar();
}

const PromoBarService = {
  getPromoBar,
  updatePromoBar,
};

export default PromoBarService;
