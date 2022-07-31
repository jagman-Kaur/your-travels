const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const fs = require("fs");
const getCoordsForAdd = require("../utils/location");
const { uploadFile } = require('../s3');

const { v4: uuidv4 } = require("uuid");

const Place = require("../models/places");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");
const { startSession } = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const pid = req.params.pid;
  let place;

  try {
    place = await Place.findById(pid);
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for given place id", 404)
    );
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const uid = req.params.uid;
  let places;

  try {
    places = await Place.find({ creator: uid });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (!places || places.length === 0) {
    return res.json([]);
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new HttpError("Invalid input", 404);
    return next(error);
  }
  const { title, description, address } = req.body;

  const coordinates = getCoordsForAdd(address);
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError("Creating place failed", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not fid user", 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch {
    const error = new HttpError("Creating place failed", 500);
    return next(error);
  }
 
  let result;
  try{
    console.log(req.file)
    result = await uploadFile(req.file);
  }catch(err){
    const error = new HttpError("Could not upload file to s3", 401);
    return next(error);
  }

  res.status(201).json({ place: createdPlace, imagePath: `/uploads/images/${result.key}` });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError("Invalid input", 404);
    return next(error);
  }
  const pid = req.params.pid;
  const { title, description } = req.body;

  let place;

  try {
    place = await Place.findById(pid);
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("Not authorized to update this place", 401);
    return next(error);
  }
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const pid = req.params.pid;
  let place;

  try {
    place = await Place.findById(pid).populate("creator");
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError("Could not find place for this id", 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError("Not authorized to delete this place", 401);
    return next(error);
  }
  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: "Place deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
