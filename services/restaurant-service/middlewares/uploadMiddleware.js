// uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const FileType = require('file-type'); // use file-type to sniff file contents

// temp folder for incoming files
const TEMP_DIR = path.join(__dirname, 'tmp_uploads');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_DIR),
  filename: (req, file, cb) => {
    // random filename, keep extension later after validation
    const name = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB max (adjust)
  },
  fileFilter: (_req, file, cb) => {
    // Quick reject by client mime-type heuristics (not enough alone)
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Invalid mime type'), false);
    }
    cb(null, true);
  }
});

async function validateAndMove(tempPath, finalDir) {
  // validate file signature with file-type
  const buffer = fs.readFileSync(tempPath);
  const ft = await FileType.fromBuffer(buffer);
  if (!ft) throw new Error('Cannot determine file type');
  const allowed = ['image/png','image/jpeg','image/webp'];
  if (!allowed.includes(ft.mime)) throw new Error('Disallowed file type');

  // set extension based on actual file type
  const ext = ft.ext; // e.g. 'png' or 'jpg'
  const finalName = Date.now() + '-' + crypto.randomBytes(6).toString('hex') + '.' + ext;
  if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });
  const finalPath = path.join(finalDir, finalName);
  fs.renameSync(tempPath, finalPath);
  return { finalPath, finalName, mime: ft.mime };
}

module.exports = { upload, validateAndMove, TEMP_DIR };
