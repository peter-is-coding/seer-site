const express = require("express");
const router = express.Router();
const catchAsync = require("../util/catchAsync");
const Landmark = require("../models/landmark");
const { forceLogin, validateLandmark } = require("../util/middleware");
const ExpressError = require("../util/ExpressError");

const { landmarkSchema } = require("../schemas");

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
    validateLandmark,
    catchAsync(async (req, res) => {
        const landmark = new Landmark(req.body.landmark);
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
    "/:id",
    catchAsync(async (req, res) => {
        try {
            const landmark = await Landmark.findById(req.params.id); //only way to handle error on on this seems to be try/catch
            //if (!landmark) throw new ExpressError("Landmark ID not found", 400);
            landmark.populate("reviews");
            res.render("landmarks/show", { landmark });
        } catch (err) {
            req.flash("error", `Error finding landmark id: ${req.params.id}`);
            res.redirect("/landmarks");
        }
    })
);

router.get(
    "/:id/edit",
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findById(req.params.id);
        //if (!landmark) throw new ExpressError("Landmark ID not found", 400);
        if (!landmark) {
            req.flash("error", "Landmark ID not found.");
            res.render("landmarks", { landmark });
        } else {
            res.render("landmarks/edit", { landmark });
        }
    })
);

router.patch(
    "/:id/edit",
    validateLandmark,
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findByIdAndUpdate(
            req.params.id,
            req.body.landmark
        );
        //if (!landmark) throw new ExpressError("Landmark ID not found", 400);
        if (!landmark) {
            req.flash("error", "Landmark ID not found.");
            res.render("landmarks", { landmark });
        } else {
            req.flash("success", "Landmark updated.");
            res.redirect(`/landmarks/${landmark._id}`);
        }
    })
);

router.delete(
    "/:id",
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findByIdAndDelete(req.params.id);
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
