const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const movieRoute = require("./routes/movie");
const router = express.Router();
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const portNum = process.env.PORT_NUM || 5000;

//cors middleware
app.use(cors());

app.use("/uploads", express.static("uploads"));

//body parser middleware
app.use(express.urlencoded({ extended: false }));

//Connect mongodb
mongoose
  .connect(process.env.DB_KEY, options)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });
mongoose.Promise = global.Promise;

// routes
app.use("/api", movieRoute);

// starting server
app.listen(portNum, () => {
  console.log(`Server up and running at port ${portNum}`);
});
