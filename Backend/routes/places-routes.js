const express = require("express");
const { check } = require("express-validator");
const auth = require('../middleware/auth');

const router = express.Router();

const placeControllers = require("../controllers/places-controller");

const fileUpload = require("../middleware/file-upload");

const { getFileStream } = require('../s3');

router.get("/:pid", placeControllers.getPlaceById);

router.get("/users/:uid", placeControllers.getPlacesByUserId);

router.get('/uploads/images/:key', (req, res) => {
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
})

router.use(auth);

router.post(
  "/",
  fileUpload.single('image'),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placeControllers.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placeControllers.updatePlace
);


router.delete("/:pid", placeControllers.deletePlace);

module.exports = router;
