import { randomUUID } from "crypto";
import { AppDataSource } from "../../data-source";
import { Cart } from "../../entity/Cart";
import { CartItem } from "../../entity/CartItem";
import { Design } from "../../entity/Design";
import { GuestSession } from "../../entity/GuestSession";
import { CartLicenseEnum, CartStatusEnum } from "../../enums/cart.enum";
import { DesignStatusEnum } from "../../enums/design.enum";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { IAddCartItem } from "../../interface/cart.interface";
import ABSTRACT_SERVICE, { createError } from "../abstractService/abstractService";

// Mirrors the colour-change fee schedule shown on the storefront so the
// server stays the source of truth for pricing.
const COLOR_CHANGE_FEES: Record<number, number> = {
  0: 0,
  1: 25000,
  2: 50000,
  3: 75000,
  4: 100000,
  5: 125000,
};

const serializeCart = (cart: Cart) => ({
  id: cart.id,
  items: (cart.items ?? []).map((item) => ({
    id: item.id,
    designId: item.designId,
    title: item.design?.title ?? "",
    slug: item.design?.slug ?? "",
    image: item.design?.mainImage ?? "",
    license: item.license,
    colorChanges: item.colorChanges,
    unitPrice: item.unitPrice,
    colorChangeFee: item.colorChangeFee,
    price: item.unitPrice + item.colorChangeFee,
    selected: item.selected,
  })),
});

async function createSession() {
  const session = (await ABSTRACT_SERVICE.createData(GuestSession, {
    id: randomUUID(),
    lastActiveAt: new Date(),
  })) as GuestSession;

  await ABSTRACT_SERVICE.createData(Cart, {
    guestSessionId: session.id,
    status: CartStatusEnum.ACTIVE,
  });

  return { sessionId: session.id };
}

async function getSession(sessionId: string) {
  const session = (await ABSTRACT_SERVICE.getUniqueData(GuestSession, { id: sessionId })) as GuestSession | null;
  if (!session) {
    throw createError("Guest session not found", ResponseCodeEnum.NOT_FOUND);
  }

  ABSTRACT_SERVICE.updateByEntry(GuestSession, { id: session.id }, { lastActiveAt: new Date() }).catch(() => {});
  return session;
}

async function getActiveCart(sessionId: string) {
  const repository = AppDataSource.getRepository(Cart);
  let cart = await repository.findOne({
    where: { guestSessionId: sessionId, status: CartStatusEnum.ACTIVE },
    relations: ["items", "items.design"],
    order: { items: { id: "ASC" } },
  });

  if (!cart) {
    cart = (await ABSTRACT_SERVICE.createData(Cart, {
      guestSessionId: sessionId,
      status: CartStatusEnum.ACTIVE,
    })) as Cart;
    cart.items = [];
  }

  return cart;
}

async function getCart(sessionId: string) {
  await getSession(sessionId);
  const cart = await getActiveCart(sessionId);
  return serializeCart(cart);
}

async function addItem(sessionId: string, { designId, license, colorChanges }: IAddCartItem) {
  await getSession(sessionId);

  const design = (await ABSTRACT_SERVICE.getUniqueData(Design, { id: designId })) as Design | null;
  if (!design || design.status !== DesignStatusEnum.ACTIVE) {
    throw createError("Design not found", ResponseCodeEnum.NOT_FOUND);
  }

  const colorChangeFee = COLOR_CHANGE_FEES[colorChanges];
  if (colorChangeFee === undefined) {
    throw createError("Invalid number of colour changes", ResponseCodeEnum.BAD_REQUEST);
  }

  const cart = await getActiveCart(sessionId);
  const itemRepository = AppDataSource.getRepository(CartItem);
  const existing = await itemRepository.findOneBy({ cartId: cart.id, designId, license, colorChanges });

  if (!existing) {
    await ABSTRACT_SERVICE.createData(CartItem, {
      cartId: cart.id,
      designId,
      license,
      colorChanges,
      unitPrice: license === CartLicenseEnum.EXCLUSIVE ? design.exclusivePrice : design.nonExclusivePrice,
      colorChangeFee,
      selected: true,
    });
  } else if (!existing.selected) {
    await itemRepository.update(existing.id, { selected: true });
  }

  const updated = await getActiveCart(sessionId);
  return serializeCart(updated);
}

async function findSessionItem(sessionId: string, itemId: number) {
  const cart = await getActiveCart(sessionId);
  const item = (cart.items ?? []).find((entry) => entry.id === itemId);
  if (!item) {
    throw createError("Cart item not found", ResponseCodeEnum.NOT_FOUND);
  }
  return { cart, item };
}

async function updateItemSelection(sessionId: string, itemId: number, selected: boolean) {
  await getSession(sessionId);
  const { item } = await findSessionItem(sessionId, itemId);
  await ABSTRACT_SERVICE.updateById(CartItem, item.id, { selected });

  const updated = await getActiveCart(sessionId);
  return serializeCart(updated);
}

async function removeItem(sessionId: string, itemId: number) {
  await getSession(sessionId);
  await findSessionItem(sessionId, itemId);
  await ABSTRACT_SERVICE.removeData(CartItem, { id: itemId });

  const updated = await getActiveCart(sessionId);
  return serializeCart(updated);
}

async function setSelection(sessionId: string, selected: boolean) {
  await getSession(sessionId);
  const cart = await getActiveCart(sessionId);
  await AppDataSource.getRepository(CartItem).update({ cartId: cart.id }, { selected });

  const updated = await getActiveCart(sessionId);
  return serializeCart(updated);
}

const CartService = {
  createSession,
  getCart,
  addItem,
  updateItemSelection,
  removeItem,
  setSelection,
};

export default CartService;
