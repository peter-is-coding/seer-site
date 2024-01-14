const Landmark = require("../models/landmark");
const Review = require("../models/review");
const catchAsync = require("../util/catchAsync");
const User = require("../models/user");

module.exports.getLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.getRegisterForm = (req, res) => {
    res.render("users/register");
};

module.exports.register = catchAsync(async (req, res) => {
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
});

module.exports.loginProcess = (req, res) => {
    req.flash("success", "Welcome user.");
    if (res.locals.returnPath) {
        res.redirect(res.locals.returnPath);
    } else {
        res.redirect("/landmarks");
    }
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        } else {
            req.flash("success", "Goodbye");
            res.redirect("/landmarks");
        }
    });
};
