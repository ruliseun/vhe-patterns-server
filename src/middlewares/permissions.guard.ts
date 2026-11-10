import { NextFunction, Request, Response } from "express";

export function permissionsGuard(permissions?: string[], requireAll = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!permissions || permissions.length == 0) return next();

      const userProfile = (req as any).profile;
      if (!userProfile) {
        return res.status(403).json({ error: true, message: "No permission to access resource", status: "4038" });
      }

      const validPermissions = new Set([
        ...(userProfile?.role?.permissions?.map((p: { name: string }) => p.name) || []),
        ...(userProfile?.permissions?.map((p: { permission: string }) => p.permission) || []),
      ]);

      const hasPermission = requireAll
        ? permissions.every((p) => validPermissions.has(p))
        : permissions.some((p) => validPermissions.has(p));

      if (!hasPermission) {
        return res.status(403).json({
          error: true,
          message: "No permission to access resource",
          status: "4037",
        });
      }
      return next();
    } catch (error) {
      console.error("Error in roleGuard middleware:", error);
      return res.status(error.httpStatusCode || 500).json({
        error: true,
        status: error.httpStatusCode || "5000",
        message: error.message || "Failed Processing Request. Try again.",
      });
    }
  };
}
