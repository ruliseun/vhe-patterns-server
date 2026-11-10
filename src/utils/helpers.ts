import { IUser } from "../interface/user.interface";


export function manualDataPagination(
  data: any[],
  page: number,
  itemsPerPage: number,
  identifier = "data",
  metadata = {},
) {
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let totalAttendees = 0;

  // page = Math.max(1, Math.min(page, totalPages || 1));

  if (identifier === "attendances") data.map((d) => (totalAttendees += d.attendees.length));

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedData = data.slice(startIndex, endIndex);

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    [identifier]: paginatedData,
    total: identifier === "attendances" ? totalAttendees : totalItems,
    last_page: totalPages,
    current_page: page,
    has_next_page: hasNextPage,
    has_prev_page: hasPrevPage,
    next_page: hasNextPage ? page + 1 : null,
    previous_page: hasPrevPage ? page - 1 : null,
    ...metadata,
  };
}

export function extractPermissions(userProfile: any) {
  const rolePermissions = (userProfile.role?.permissions || []).map((perm: any) => perm.name);
  const userPermissions = (userProfile.permissions || []).map((perm: any) => perm.permission);
  return [...new Set([...rolePermissions, ...userPermissions])];
}

export function formatDateToString(dateString?: string): string {
  const date = dateString ? new Date(dateString) : new Date();

  if (isNaN(date.getTime())) return "";

  const formatted = date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formatted}`;
}

export const isNumericString = (value: any) => {
  return typeof value === "string" && value.trim() !== "" && !isNaN(Number(value));
};

export const userHasPermission = (userProfile: IUser, permissions: string[]): boolean => {
  const userPermissions = new Set([
    ...(userProfile?.role?.permissions?.map((p: any) => p.name) || []),
    ...(userProfile?.permissions?.map((p: { permission: string }) => p.permission) || []),
  ]);

  return permissions.some((p) => userPermissions.has(p));
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const sanitizeUpdates = (data: any): any => {
  const cleaned: any = {};
  for (const key in data) {
    // Only excludes undefined and null, keep false, 0, empty string
    if (data[key] !== undefined && data[key] !== null) {
      cleaned[key] = data[key];
    }
  }
  return cleaned;
};

export function formatPeriod(start: Date, end: Date, opts: any = {}) {
  const { includeYear = false } = opts;

  const day = (d: Date) => d.getDate();
  const month = (d: Date) => d.toLocaleString("en-US", { month: "long" });
  const year = (d: Date) => d.getFullYear();

  const startDay = day(start);
  const endDay = day(end);
  const startMonth = month(start);
  const endMonth = month(end);

  if (includeYear) {
    return `${startDay} ${startMonth} ${year(start)} - ${endDay} ${endMonth} ${year(end)}`;
  } else {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }
}

export function stripHtmlPreserveTemplates(input: string): string {
  if (!input) return input;

  // Temporarily protect {{ }} blocks
  const placeholders: string[] = [];
  const protectedText = input.replace(/{{\s*[^}]+\s*}}/g, (match) => {
    placeholders.push(match);
    return `__PLACEHOLDER_${placeholders.length - 1}__`;
  });

  // Strip HTML tags
  const stripped = protectedText.replace(/<\/?[^>]+>/gi, "");

  // Restore {{ }} blocks
  return stripped.replace(/__PLACEHOLDER_(\d+)__/g, (_, index) => {
    return placeholders[Number(index)];
  });
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
