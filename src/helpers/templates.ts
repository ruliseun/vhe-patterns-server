import fs from "fs";
import path from "path";

// `npm run build` copies templates into dist, but `tsc -w` doesn't, so fall back between src and dist.
const TEMPLATE_DIRS = [path.join(process.cwd(), "src/templates"), path.join(__dirname, "../templates")];

export const templatePath = (name: string): string => {
  const candidates = TEMPLATE_DIRS.map((dir) => path.join(dir, name));
  return candidates.find((file) => fs.existsSync(file)) ?? candidates[candidates.length - 1];
};
