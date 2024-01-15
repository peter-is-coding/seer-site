const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../util/catchAsync");
const { storeReturnPath } = require("../util/middleware");
//const { userSchema } = require("../schemas");

const passport = require("passport");
const users = require("../controllers/users");

router.route("/register").get(users.getRegisterForm).post(users.register);

router
    .route("/login")
    .get(users.getLoginForm)
    .post(
        storeReturnPath,
        passport.authenticate("local", {
            failureFlash: true,
            failureRedirect: "/login",
        }),
        users.loginProcess
    );

router.get("/logout", users.logout);

module.exports = router;
