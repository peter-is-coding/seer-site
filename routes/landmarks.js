const express = require("express");
const router = express.Router();
const catchAsync = require("../util/catchAsync");
const Landmark = require("../models/landmark");
const {
    forceLogin,
    checkLandmarkPermissions,
    validateLandmark,
} = require("../util/middleware");
const ExpressError = require("../util/ExpressError");

router.get(
    "/",
    catchAsync(async (req, res) => {
        const landmarks = await Landmark.find({});
        res.render("landmarks/index", { landmarks });
    })
);

router.get("/new", forceLogin, (req, res) => {
    res.render("landmarks/new");
});

router.post(
    "/",
    forceLogin,
    validateLandmark,
    catchAsync(async (req, res) => {
        const landmark = new Landmark(req.body.landmark);
        landmark.creator = req.user._id;
        await landmark.save();
        if (!landmark) {
            req.flash("error", "Landmark ID not found.");
            res.redirect("/landmarks");
        } else {
            req.flash("success", "Landmark created.");
            res.redirect(`/landmarks/${landmark._id}`);
        }
    })
);

//Place variable entries below others with similar paths, or express will think another route is a parameter.
router.get(
    "/:lmid",
    catchAsync(async (req, res) => {
        try {
            const landmark = await Landmark.findById(req.params.lmid).populate([
                "reviews",
                "creator",
                {
                    path: "reviews",
                    populate: { path: "creator" },
                },
            ]); //only way to handle error on on this seems to be try/catch
            //if (!landmark) throw new ExpressError("Landmark ID not found", 400);
            //console.log(landmark);
            res.render("landmarks/show", { landmark });
        } catch (err) {
            req.flash("error", `Error finding landmark id: ${req.params.lmid}`);
            res.redirect("/landmarks");
        }
    })
);

router.get(
    "/:lmid/edit",
    forceLogin,
    checkLandmarkPermissions,
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findById(req.params.lmid);
        if (!landmark) {
            req.flash("error", "Landmark ID not found.");
            res.render("landmarks", { landmark });
        } else {
            res.render("landmarks/edit", { landmark });
        }
    })
);

router.patch(
    "/:lmid/edit",
    forceLogin,
    checkLandmarkPermissions,
    validateLandmark,
    catchAsync(async (req, res) => {
        await Landmark.findByIdAndUpdate(req.params.lmid, req.body.landmark);
        req.flash("success", "Landmark updated.");
        res.redirect(`/landmarks/${landmark._id}`);
    })
);

router.delete(
    "/:lmid",
    forceLogin,
    checkLandmarkPermissions,
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findByIdAndDelete(req.params.lmid);
        if (!landmark) {
            req.flash("error", "Landmark ID not found.");
            res.render("landmarks", { landmark });
        } else {
            req.flash("success", "Landmark deleted.");
            res.redirect(`/landmarks/`);
        }
    })
);

module.exports = router;
