import { upload } from "./uploads";

const multiFileUpload = upload().array("file", 5);
const singleFileUpload = upload().single("file");
const designFilesUpload = upload().fields([
  { name: "mainImage", maxCount: 1 },
  { name: "colorVariations", maxCount: 6 },
]);

const UploadFields = {
  multiFileUpload,
  singleFileUpload,
  designFilesUpload,
};

export default UploadFields;
