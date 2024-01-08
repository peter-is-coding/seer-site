const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./util/ExpressError");

const landmarkRouter = require("./routes/landmarks");
const reviewRouter = require("./routes/reviews");

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

app.use("/landmarks", landmarkRouter);

app.use("/landmarks/:id/reviews", reviewRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found.", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Server encountered an error.";
    //console.log(err);
    res.status(statusCode).render("error", { err, statusCode });
});

app.listen(3000, () => {
    console.log("Server open on port 3000");
});
