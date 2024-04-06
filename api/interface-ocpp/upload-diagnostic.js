"use strict";
const models = require("../../models");
const { USER_ROLE } = require("../../middleware/role.middleware");
const sequelize = require("sequelize");
const multer = require('multer');
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = {
  path: ["/upload-diagnostic/:chg_id"],
  method: "post",
  checkToken: false,
  roles: [USER_ROLE.ALL],
  service: service,
  validator: validator,
  errorHandler: errorHandler,
};

async function service(request, response, next) {
  const chg_id = request.params.chg_id;

  try {
    // Assuming your model is named UploadDiagnostic
    const zipBuffer = request.file.buffer;

    // Create a temporary directory to extract files
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const zipPath = path.join(tempDir, "uploaded.zip");
    fs.writeFileSync(zipPath, zipBuffer);

    // Extract the contents of the zip file
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    // Assuming there is only one file in the zip
    const firstEntry = zipEntries[0];
    const extractedFilePath = path.join(tempDir, firstEntry.entryName);

    zip.extractAllTo(tempDir, true);

    // Read the extracted file content
    const extractedFileContent = fs.readFileSync(extractedFilePath);

    // Save to the database
    // const uploadDiagnostic = await models.upload_diagnostic.create({
    //   chg_id: chg_id,
    //   upload_date: new Date(),
    //   byte_code: extractedFileContent,
    // });

    // Clean up: Remove the temporary directory
    fs.unlinkSync(zipPath);
    fs.unlinkSync(extractedFilePath);
    fs.rmdirSync(tempDir);

    // response.success(uploadDiagnostic);
  } catch (e) {
    next(e);
  }
}

function validator(_request, _response, next) {
  next();
}

function errorHandler(_error, _request, _response, next) {
  console.error(_error);

  _response.error.unknown(_error.toString());
  next(_error);
}
