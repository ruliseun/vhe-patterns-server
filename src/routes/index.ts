import { appVersion } from "../config/constants";
import pingRoutes from "./ping";
import authRoutes from "./auth.route";
import permissionRoutes from "./permissions.route";
import rolesRoutes from "./roles.route";
import paymentRoutes from "./payment.route";
import designRoutes from "./design.route";
import categoryRoutes from "./category.route";
import brandRoutes from "./brand.route";
import contactRoutes from "./contact.route";
import customPrintRoutes from "./custom-print.route";
import newsletterRoutes from "./newsletter.route";
import blogRoutes from "./blog.route";
import cartRoutes from "./cart.route";
import promoBarRoutes from "./promo-bar.route";

export default function initializeRoutes(app: { use: (arg0: string, arg1: any) => void }) {
  app.use(`/vhepatterns/api/${appVersion}/ping`, pingRoutes);
  app.use(`/vhepatterns/api/${appVersion}/auth`, authRoutes);
  app.use(`/vhepatterns/api/${appVersion}/permissions`, permissionRoutes);
  app.use(`/vhepatterns/api/${appVersion}/roles`, rolesRoutes);
  app.use(`/vhepatterns/api/${appVersion}/payments/spa`, paymentRoutes);
  app.use(`/vhepatterns/api/${appVersion}/categories`, categoryRoutes);
  app.use(`/vhepatterns/api/${appVersion}/designs`, designRoutes);
  app.use(`/vhepatterns/api/${appVersion}/brands`, brandRoutes);
  app.use(`/vhepatterns/api/${appVersion}/contact`, contactRoutes);
  app.use(`/vhepatterns/api/${appVersion}/custom-print`, customPrintRoutes);
  app.use(`/vhepatterns/api/${appVersion}/newsletter`, newsletterRoutes);
  app.use(`/vhepatterns/api/${appVersion}/blogs`, blogRoutes);
  app.use(`/vhepatterns/api/${appVersion}/cart`, cartRoutes);
  app.use(`/vhepatterns/api/${appVersion}/promo-bar`, promoBarRoutes);
}
