import { upload } from "./uploads";

const organisationLogoUploadHandler = upload().single("orgLogo");
const displayPictureUploadHandler = upload().single("photo");
const profileFilesUploadHandler = upload().array("document", 2);
const serviceAttachmentUploadHandler = upload().single("attachment");
const batchCreateUserUploadHandler = upload().single("users_list");
const batchCreateDepartmentUploadHandler = upload().single("department_list");
const batchAddDepartmentMembersUploadHandler = upload().single("department_members_list");
const fileUploadProxy = upload().array("file", 5);
const additionalInfoUploader = upload().fields([
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
