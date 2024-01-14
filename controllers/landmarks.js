const Landmark = require("../models/landmark");
const catchAsync = require("../util/catchAsync");

module.exports.index = catchAsync(async (req, res) => {
    const landmarks = await Landmark.find({});
    res.render("landmarks/index", { landmarks });
});

module.exports.new = (req, res) => {
    res.render("landmarks/new");
};

module.exports.create = catchAsync(async (req, res) => {
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
});

module.exports.get = catchAsync(async (req, res) => {
    try {
        const landmark = await Landmark.findById(req.params.lmid).populate([
            "reviews",
            "creator",
            {
                path: "reviews",
                populate: { path: "creator" },
            },
        ]); //only way to handle error on on this seems to be try/catch
        res.render("landmarks/show", { landmark });
    } catch (err) {
        req.flash("error", `Error finding landmark id: ${req.params.lmid}`);
        res.redirect("/landmarks");
    }
});

module.exports.getEditForm = catchAsync(async (req, res) => {
    const landmark = await Landmark.findById(req.params.lmid);
    if (!landmark) {
        req.flash("error", "Landmark ID not found.");
        res.render("landmarks", { landmark });
    } else {
        res.render("landmarks/edit", { landmark });
    }
});

module.exports.update = catchAsync(async (req, res) => {
    await Landmark.findByIdAndUpdate(req.params.lmid, req.body.landmark);
    req.flash("success", "Landmark updated.");
    res.redirect(`/landmarks/${landmark._id}`);
});

module.exports.delete = catchAsync(async (req, res) => {
    const landmark = await Landmark.findByIdAndDelete(req.params.lmid);
    if (!landmark) {
        req.flash("error", "Landmark ID not found.");
        res.render("landmarks", { landmark });
    } else {
        req.flash("success", "Landmark deleted.");
        res.redirect(`/landmarks/`);
    }
});
