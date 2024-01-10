const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../util/catchAsync");
//const { userSchema } = require("../schemas");
const User = require("../models/user");
const passport = require("passport");

router.get("/register", (req, res) => {
    res.render("users/register");
});

router.post(
    "/register",
    catchAsync(async (req, res) => {
        try {
            const { username, password } = req.body.user;
            const user = await new User({ username });
            const pwUser = await User.register(user, password);
            res.redirect("/");
        } catch (err) {
            req.flash("error", err.message);
            res.redirect("/register");
        }
    })
);

router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post(
    "/login",
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
    }),
    (req, res) => {
        req.flash("success", "Welcome user.");
        res.redirect("/landmarks");
    }
);

module.exports = router;
