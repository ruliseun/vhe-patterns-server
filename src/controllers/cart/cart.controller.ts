import { Request, Response } from "express";
import { matchedData } from "express-validator";
import { ResponseCodeEnum } from "../../enums/response-codes.enum";
import { IAddCartItem, ICartSelection } from "../../interface/cart.interface";
import CartService from "../../service/cart/cart.service";
import Logger from "../../utils/logger";

const SESSION_HEADER = "x-guest-session";

const handleError = (res: Response, error: { httpStatusCode?: number; message?: string }, fallback: string) =>
  res.status(error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR).json({
    status: error.httpStatusCode || ResponseCodeEnum.INTERNAL_SERVER_ERROR,
    message: error.message || fallback,
    data: null,
  });

const sessionIdFrom = (req: Request) => String(req.get(SESSION_HEADER) ?? "");

const createSession = async (_req: Request, res: Response) => {
  try {
    const session = await CartService.createSession();

    return res.status(ResponseCodeEnum.CREATED).json({
      status: ResponseCodeEnum.CREATED,
      message: "Guest session created",
      data: session,
    });
  } catch (error) {
    Logger.error("Error creating guest session:::", error);
    return handleError(res, error, "Error creating guest session");
  }
};

const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await CartService.getCart(sessionIdFrom(req));

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    Logger.error("Error retrieving cart:::", error);
    return handleError(res, error, "Error retrieving cart");
  }
};

const addItem = async (req: Request, res: Response) => {
  const data = matchedData(req) as IAddCartItem;
  try {
    const cart = await CartService.addItem(sessionIdFrom(req), data);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    Logger.error("Error adding item to cart:::", error);
    return handleError(res, error, "Error adding item to cart");
  }
};

const updateItem = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICartSelection;
  try {
    const cart = await CartService.updateItemSelection(sessionIdFrom(req), Number(req.params.id), data.selected);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Cart item updated",
      data: cart,
    });
  } catch (error) {
    Logger.error("Error updating cart item:::", error);
    return handleError(res, error, "Error updating cart item");
  }
};

const removeItem = async (req: Request, res: Response) => {
  try {
    const cart = await CartService.removeItem(sessionIdFrom(req), Number(req.params.id));

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error) {
    Logger.error("Error removing cart item:::", error);
    return handleError(res, error, "Error removing cart item");
  }
};

const setSelection = async (req: Request, res: Response) => {
  const data = matchedData(req) as ICartSelection;
  try {
    const cart = await CartService.setSelection(sessionIdFrom(req), data.selected);

    return res.status(ResponseCodeEnum.OK).json({
      status: ResponseCodeEnum.OK,
      message: "Cart selection updated",
      data: cart,
    });
  } catch (error) {
    Logger.error("Error updating cart selection:::", error);
    return handleError(res, error, "Error updating cart selection");
  }
};

const CartController = {
  createSession,
  getCart,
  addItem,
  updateItem,
  removeItem,
  setSelection,
};

export default CartController;
