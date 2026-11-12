import crypto from "crypto";
import { API_KEY, TOKENS } from "../config/env";

const secret = () => TOKENS.auth_token_secret || API_KEY || "";

const sign = (id: number, email: string) =>
  crypto.createHmac("sha256", secret()).update(`newsletter-unsubscribe:${id}:${email}`).digest("base64url");

export const createUnsubscribeToken = (id: number, email: string) => `${id}.${sign(id, email)}`;

export const parseUnsubscribeToken = (token: string): { id: number; signature: string } | null => {
  const [rawId, signature] = token.split(".");
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1 || !signature) return null;
  return { id, signature };
};

export const isValidUnsubscribeSignature = (id: number, email: string, signature: string) => {
  const expected = Buffer.from(sign(id, email));
  const received = Buffer.from(signature);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
};
