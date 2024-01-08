const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const Landmark = require("./models/landmark");
const Review = require("./models/review");
const methodOverride = require("method-override");
const ExpressError = require("./util/ExpressError");
const catchAsync = require("./util/catchAsync");
const { landmarkSchema, reviewSchema } = require("./schemas");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/seersite-test", {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to DB:"));
db.once("open", () => {
  console.log("Connect to DB.");
});

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/landmarks",
  catchAsync(async (req, res) => {
    const landmarks = await Landmark.find({});
    res.render("landmarks/index", { landmarks });
  })
);

app.get("/landmarks/new", (req, res) => {
  res.render("landmarks/new");
});

const validateLandmark = (req, res, next) => {
  const result = landmarkSchema.validate(req.body);
  if (result.error) {
    const err = result.error.details.map((e) => e.message).join(";");
    throw new ExpressError(err, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const result = reviewSchema.validate(req.body);
  if (result.error) {
    const err = result.error.details.map((e) => e.message).join(";");
    throw new ExpressError(err, 400);
  } else {
    next();
  }
};

app.post(
  "/landmarks",
  validateLandmark,
  catchAsync(async (req, res) => {
    const landmark = new Landmark(req.body.landmark);
    await landmark.save();
    res.redirect(`/landmarks/${landmark._id}`);
  })
);

//Place variable entries below others with similar paths, or express will think another route is a parameter.
app.get(
  "/landmarks/:id",
  catchAsync(async (req, res) => {
    const landmark = await Landmark.findById(req.params.id).populate("reviews");
    if (!landmark) throw new ExpressError("Landmark ID not found", 400);
    res.render("landmarks/show", { landmark });
  })
);

app.get(
  "/landmarks/:id/edit",
  catchAsync(async (req, res) => {
    const landmark = await Landmark.findById(req.params.id);
    if (!landmark) throw new ExpressError("Landmark ID not found", 400);
    res.render("landmarks/edit", { landmark });
  })
);

app.patch(
  "/landmarks/:id/edit",
  validateLandmark,
  catchAsync(async (req, res) => {
    const landmark = await Landmark.findByIdAndUpdate(req.params.id, req.body.landmark);
    if (!landmark) throw new ExpressError("Landmark ID not found", 400);
    res.redirect(`/landmarks/${landmark._id}`);
  })
);

app.delete(
  "/landmarks/:id",
  catchAsync(async (req, res) => {
    await Landmark.findByIdAndDelete(req.params.id);
    res.redirect(`/landmarks/`);
  })
);

app.post(
  "/landmarks/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const landmark = await Landmark.findById(req.params.id);
    const review = new Review(req.body.review);
    landmark.reviews.push(review);
    await review.save();
    await landmark.save();
    res.redirect(`/landmarks/${landmark._id}`);
  })
);

app.delete(
  "/landmarks/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Landmark.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/landmarks/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found.", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Server encountered an error.";
  console.log(err);
  res.status(statusCode).render("error", { err, statusCode });
});

app.listen(3000, () => {
  console.log("Server open on port 3000");
});
