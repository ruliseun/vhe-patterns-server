import { upload, uploadFileArray } from "./uploads";

const organisationLogoUploadHandler = upload("orgLogo").single("orgLogo");
const displayPictureUploadHandler = upload("photo").single("photo");
const profileFilesUploadHandler = uploadFileArray("document").array("document", 2);
const serviceAttachmentUploadHandler = upload("attachment").single("attachment");
const batchCreateUserUploadHandler = upload("users_list").single("users_list");
const batchCreateDepartmentUploadHandler = upload("department_list").single("department_list");
const batchAddDepartmentMembersUploadHandler = upload("department_members_list").single("department_members_list");
const fileUploadProxy = uploadFileArray("file").array("file", 5);
const additionalInfoUploader = upload("passport").fields([
  { name: "passport", maxCount: 1 },
  { name: "ordination_cert", maxCount: 1 },
  { name: "baptismal_cert", maxCount: 1 },
  { name: "schl_of_disciple_cert", maxCount: 1 },
  { name: "workers_training_cert", maxCount: 1 },
]);

const UploadFields = {
  organisationLogoUploadHandler,
  displayPictureUploadHandler,
  profileFilesUploadHandler,
  serviceAttachmentUploadHandler,
  batchCreateUserUploadHandler,
  batchCreateDepartmentUploadHandler,
  batchAddDepartmentMembersUploadHandler,
  fileUploadProxy,
  additionalInfoUploader,
};

export default UploadFields;
