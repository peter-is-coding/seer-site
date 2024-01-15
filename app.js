if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./util/ExpressError");
const User = require("./models/user");
const { setFlashes, setUserDetails } = require("./util/middleware");

const landmarkRouter = require("./routes/landmarks");
const reviewRouter = require("./routes/reviews");
const userRouter = require("./routes/users");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride("_method"));

//Base session config
const sessionConfig = {
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    },
};
app.use(session(sessionConfig));

// //Passport login setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use(setFlashes);
app.use(setUserDetails);

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/seersite-test", {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to DB:"));
db.once("open", () => {
    console.log("Connect to DB.");
});

app.use((req, res, next) => {
    req.requestTime = Date.now();
    next();
});

app.get("/", (req, res) => {
    res.render("home");
});

app.use("/", userRouter);
app.use("/landmarks", landmarkRouter);
app.use("/landmarks/:lmid/reviews", reviewRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found.", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Server encountered an error.";
    res.status(statusCode).render("error", { err, statusCode });
});

app.listen(3000, () => {
    console.log("Server open on port 3000");
});
