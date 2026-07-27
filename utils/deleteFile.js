import fs from "fs";

function deleteFile(path) {
  if (path && fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

export default deleteFile;
