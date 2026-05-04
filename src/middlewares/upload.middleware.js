const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/;

  const valid = allowed.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (valid) {
    cb(null, true);
  } else {
    cb(new Error('Formato no permitido'));
  }
};

module.exports = multer({
  storage,
  fileFilter,
});