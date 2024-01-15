const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/seersite-test", {});
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
    const newUser = await new User({ username: "admin" });
    const adminUser = await User.register(newUser, "admin");

    for (let i = 0; i < 15; i++) {
        const f = sample(seedHelpers.first);
        const m = sample(seedHelpers.middle);
        const l = sample(seedHelpers.last);
        const title = `${f} ${m} ${l}`;
        const landmark = new Landmark({
            title,
            location: "Sydney Australia",
            geometry: {
                type: "Point",
                coordinates: [151.2106825, -33.8522605],
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
