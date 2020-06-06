const router = require("express").Router();
const monogoose = require("mongoose");
const multer = require("multer");
const Movies = require("../models/Movies");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  //reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

//post route
router.post("/movies", upload.single("img"), (req, res) => {
  // console.log(req.file);
  if (req.file) {
    const movie = new Movies({
      name: req.body.name,
      summary: req.body.summary,
      img: req.file.path,
    });
    movie
      .save()
      .then((result) => {
        res.status(200).json({ "successfully created": result });
      })
      .catch((err) => {
        res
          .status(500)
          .json({ error: "Unsuccessfull, something went wrong!!!" });
      });
  } else {
    res.status(400).json({ Message: "Plz upload file" });
  }
});

//get all movie route
router.get("/movies", (req, res) => {
  Movies.find({}, { name: 1, img: 1, summary: 1, _id: 1 })
    .then((movies) => {
      res.status(200).json({
        "All movies": movies,
      });
    })
    .catch((err) => {
      res.status(404).json({ error: "No records in the collection" });
    });
});

//get single movie

router.get("/movies/:movieId", (req, res) => {
  Movies.findById({ _id: req.params.movieId })
    .then((movie) => {
      res.status(200).json({
        name: movie.name,
        img: movie.img,
        summary: movie.summary,
      });
    })
    .catch((err) => {
      res.status(404).json({ error: "Movie not found" });
    });
});

// Update a movie
router.put("/movies/:movieId", upload.single("img"), (req, res) => {
  Movies.findById({ _id: req.params.movieId })
    .then((movie) => {
      movie.name = req.body.name;
      movie.summary = req.body.summary;

      const delFile = path.join(path.dirname(__dirname), movie.img);
      fs.unlinkSync(delFile);
      movie.img = req.file.path;
      movie.save();
      res.status(200).json({ Success: "file updated" });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

//Delete a movie

router.delete("/movies/:movieId", (req, res) => {
  Movies.findByIdAndDelete({ _id: req.params.movieId })
    .then((movie) => {
      const removeFile = path.join(path.dirname(__dirname), movie.img);
      fs.unlinkSync(removeFile);
      res
        .status(200)
        .json({ Success: `Movie deleted with id ${req.params.movieId}` });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});
module.exports = router;
