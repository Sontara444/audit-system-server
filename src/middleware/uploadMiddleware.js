const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const checkFileType = (file, cb) => {
    const filetypes = /csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images only! (Just kidding, CSV only!)'));
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only .csv files are allowed!'), false);
        }
    },
});

module.exports = upload;
