const multer = require('multer');

// We use memory storage because we will stream the file directly to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;