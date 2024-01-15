if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const dbURL = "mongodb://localhost:27017/seersite-test";
// const dbURL = `${process.env.MONGODB_URL}`

const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
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

app.use(
    mongoSanitize(
        mongoSanitize({
            replaceWith: "_",
        })
    )
);

app.use(methodOverride("_method"));

//Helmet config
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],

            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlgfapwuf/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const store = MongoStore.create({
    mongoUrl: dbURL,
    toughAfter: 24 * 60 * 60,
    crypto: {
        secret: `${process.env.SESSION_SECRET}`,
    },
});

store.on("error", (e) => {
    console.log("Session store error");
});

//Base session config
const sessionConfig = {
    store: store,
    name: "seersite-session",
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        //secure: true, //requires https
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

mongoose.connect(dbURL, {});
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
