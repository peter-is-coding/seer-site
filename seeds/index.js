const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL, {});
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Landmark = require("../models/landmark");
const User = require("../models/user");
const Review = require("../models/review");
const seedHelpers = require("./seedHelpers");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to DB:"));
db.once("open", () => {
    console.log("Connect to DB.");
});

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomFloatInRange = function (x, y) {
    const size = Math.abs(x - y);
    const base = x < y ? x : y;
    return base + Math.random() * size;
};

const seedDB = async () => {
    await Landmark.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    passport.initialize();
    passport.session();
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    //Make admin user as creator of seed data.
    const newUser = await new User({ username: process.env.ADMINUSER_NAME });
    const adminUser = await User.register(newUser, process.env.ADMINUSER_PW);

    for (let i = 0; i < 15; i++) {
        const f = sample(seedHelpers.first);
        const m = sample(seedHelpers.middle);
        const l = sample(seedHelpers.last);
        const title = `${f} ${m} ${l}`;
        const landmark = new Landmark({
            title,
            location: "Somewhere...",
            geometry: {
                type: "Point",
                coordinates: [
                    randomFloatInRange(-123, -80),
                    randomFloatInRange(50, 32),
                ],
            },
            creator: adminUser,
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae optio voluptates distinctio nulla aut! Exercitationem, blanditiis laboriosam. Voluptatum, unde repellendus magni dolorem porro architecto ipsam nihil dolore nostrum id recusandae?",
        });
        await landmark.save();
    }
};

seedDB().then(() => {
    db.close();
    console.log("Data seeding complete.");
});
