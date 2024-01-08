const express = require("express");
const router = express.Router();
const catchAsync = require("../util/catchAsync");
const Landmark = require("../models/landmark");

const ExpressError = require("../util/ExpressError");

const { landmarkSchema } = require("../schemas");

const validateLandmark = (req, res, next) => {
    const result = landmarkSchema.validate(req.body);
    if (result.error) {
        const err = result.error.details.map((e) => e.message).join(";");
        throw new ExpressError(err, 400);
    } else {
        next();
    }
};

router.get(
    "/",
    catchAsync(async (req, res) => {
        const landmarks = await Landmark.find({});
        res.render("landmarks/index", { landmarks });
    })
);

router.get("/new", (req, res) => {
    res.render("landmarks/new");
});

router.post(
    "/",
    validateLandmark,
    catchAsync(async (req, res) => {
        const landmark = new Landmark(req.body.landmark);
        await landmark.save();
        res.redirect(`/landmarks/${landmark._id}`);
    })
);

//Place variable entries below others with similar paths, or express will think another route is a parameter.
router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findById(req.params.id).populate(
            "reviews"
        );
        if (!landmark) throw new ExpressError("Landmark ID not found", 400);
        res.render("landmarks/show", { landmark });
    })
);

router.get(
    "/:id/edit",
    catchAsync(async (req, res) => {
        const landmark = await Landmark.findById(req.params.id);
        if (!landmark) throw new ExpressError("Landmark ID not found", 400);
        res.render("landmarks/edit", { landmark });
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
        if (!landmark) throw new ExpressError("Landmark ID not found", 400);
        res.redirect(`/landmarks/${landmark._id}`);
    })
);

router.delete(
    "/:id",
    catchAsync(async (req, res) => {
        await Landmark.findByIdAndDelete(req.params.id);
        res.redirect(`/landmarks/`);
    })
);

module.exports = router;
