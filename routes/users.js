const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../util/catchAsync");
const { storeReturnPath } = require("../util/middleware");
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
            const regUser = await User.register(user, password);
            req.login(regUser, (err) => {
                if (err) return next(err);
                res.redirect("/");
            });
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
    storeReturnPath,
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login",
    }),
    (req, res) => {
        req.flash("success", "Welcome user.");
        if (res.locals.returnPath) {
            res.redirect(res.locals.returnPath);
        } else {
            res.redirect("/landmarks");
        }
    }
);

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        } else {
            req.flash("success", "Goodbye");
            res.redirect("/landmarks");
        }
    });
});

module.exports = router;
