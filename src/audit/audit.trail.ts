import { NextFunction, Request, Response } from "express";
import { AuditTrailModel } from "./audit.model";
import { matchedData } from "express-validator";
import { PAGINATION } from "../config/constants";
import { ProfileTypeEnum } from "../enums/user-type.enum";
import { IUser } from "../interface/user.interface";
import mongoose from "mongoose";

const methodMappers: any = {
  GET: "Fetching",
  POST: "Request",
  PATCH: "Updating",
  DELETE: "Deleting",
};

export function logAuditTrails(req: Request, res: Response, next: NextFunction) {
  try {
    const originalJson = res.json;
    (res as any).json = async function (body: any) {
      const method = req.method;
      const userProfile = (req as any).profile || {};

      (async () => {
        try {
          if (mongoose.connection.readyState !== 1) {
            console.warn("[AUDIT]: Skipping audit log - Database not connected.");
            return;
          }

          await AuditTrailModel.create({
            path: req.originalUrl,
            activity:
              methodMappers[method] + " " + req.originalUrl.split("/")[req.originalUrl.split("/").length - 1] || "",
            params: Object.keys(req?.params).length ? JSON.stringify(req?.params) : undefined,
            query: Object.keys(req?.query).length ? JSON.stringify(req?.query) : undefined,
            payload: Object.keys(req.body).length
              ? JSON.stringify({ ...req.body, password: "******", oldPassword: undefined })
              : undefined,
            // initiator: req.headers.authorization,
            initiator: userProfile?.activeOrganisation ? JSON.stringify(userProfile.activeOrganisation) : null,
            response: JSON.stringify(body),
            orgId: JSON.stringify(userProfile.activeOrganisationId) || "",
          });
        } catch (error) {
          console.error("[AUDIT]: Error logging audit trail:", error.message);
        }
      })();
      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    console.error(">>>>> An error occurred setting up audit trail logging >>>>>>");
    console.error(error.message);
    next();
  }
}

export async function getLogs(req: Request, res: Response) {
  const { page, limit, orgId, ...data } = matchedData(req) as { [key: string]: string };
  const userProfile = (req as any).profile as IUser;
  try {
    const currentPage = +page || 1;
    const paginate = +limit || PAGINATION;
    const filters: any = {};

    if (userProfile.role.name === ProfileTypeEnum.ADMIN) {
      filters.orgId = `${userProfile.activeOrganisationId}`;
    } else {
      if (orgId) filters.orgId = `${orgId}`;
    }

    if (Object.keys(data).length > 0) {
      for (const key in data) {
        if (data[key]) {
          filters[key] = data[key];
        }
      }
    }

    const auditLogs = await AuditTrailModel.aggregate([
      {
        $match: filters,
      },
      {
        $facet: {
          metadata: [
            {
              $count: "total",
            },
            {
              $addFields: {
                current_page: currentPage,
                has_next_page: {
                  $cond: {
                    if: {
                      $lt: [{ $multiply: [currentPage, paginate] }, "$total"],
                    },
                    then: true,
                    else: false,
                  },
                },
                has_previous_page: {
                  $cond: {
                    if: {
                      $gt: [currentPage, 1],
                    },
                    then: true,
                    else: false,
                  },
                },
                next_page: {
                  $add: [currentPage, 1],
                },
                previous_page: {
                  $cond: {
                    if: {
                      $gt: [currentPage, 1],
                    },
                    then: {
                      $subtract: [currentPage, 1],
                    },
                    else: 1,
                  },
                },
                last_page: {
                  $ceil: {
                    $divide: ["$total", paginate],
                  },
                },
              },
            },
          ],
          logs: [
            {
              $skip: (currentPage - 1) * paginate,
            },
            {
              $limit: paginate,
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
          ],
        },
      },
    ]);

    const returnData: any = {};

    if (auditLogs[0].metadata[0]) {
      returnData.auditLogs = auditLogs[0].logs;
      const [metadata] = auditLogs[0].metadata;
      returnData.metadata = metadata;
    } else {
      returnData.auditLogs = auditLogs[0].logs;
      returnData.metadata = {
        total: 0,
        current_page: 1,
        has_next_page: false,
        has_previous_page: false,
        next_page: 2,
        previous_page: 1,
        last_page: 1,
      };
    }

    return res.status(200).json({ message: "Logs fetched successfully", data: returnData });
  } catch (error) {
    console.error("Error fetching logs", error);
    return res.status(500).json({ status: false, message: "Error fetching logs" });
  }
}
