const express = require("express");

const router = express.Router();

const { check } = require("express-validator");

const userControllers = require("../controllers/user-controller");
const fileUpload = require("../middleware/file-upload");
const { getFileStream } = require('../s3');

router.get("/", userControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single('image'),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userControllers.signup
);

router.get('/uploads/images/:key', (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
 
  readStream.pipe(res);
})

router.post("/login", userControllers.login);

module.exports = router;
