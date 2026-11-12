import { upload } from "./uploads";

const multiFileUpload = upload().array("file", 5);
const singleFileUpload = upload().single("file");
const designFilesUpload = upload().fields([
  { name: "mainImage", maxCount: 1 },
  { name: "colorVariations", maxCount: 6 },
]);
const brandFilesUpload = upload().fields([
  { name: "mainImage", maxCount: 1 },
  { name: "gallery", maxCount: 6 },
]);
const customPrintImagesUpload = upload().array("images", 10);
const blogFilesUpload = upload().fields([{ name: "mainImage", maxCount: 1 }]);
const blogImageUpload = upload().single("image");

const UploadFields = {
  multiFileUpload,
  singleFileUpload,
  designFilesUpload,
  brandFilesUpload,
  customPrintImagesUpload,
  blogFilesUpload,
  blogImageUpload,
};

export default UploadFields;
