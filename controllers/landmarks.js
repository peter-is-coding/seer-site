const Landmark = require("../models/landmark");
const catchAsync = require("../util/catchAsync");
const { cloudinary } = require("../cloudinary");
const mbxToken = process.env.MAPBOX_TOKEN;
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: mbxToken });

module.exports.index = catchAsync(async (req, res) => {
    const landmarks = await Landmark.find({});
    res.render("landmarks/index", { landmarks });
});

module.exports.new = (req, res) => {
    res.render("landmarks/new");
};

module.exports.create = catchAsync(async (req, res) => {
    const location = await geocoder
        .forwardGeocode({
            query: req.body.landmark.location,
            limit: 1,
        })
        .send();
    req.body.landmark.geometry = location.body.features[0].geometry;

    const landmark = new Landmark(req.body.landmark);

    landmark.creator = req.user._id;
    if (req.files && req.files.length) {
        landmark.images = req.files.map((f) => ({
            url: f.path,
            filename: f.filename,
        }));
    } else {
        //Set default image
        // landmark.images = [
        //     {
        //         url: "/default.jpeg",
        //         filename: null,
        //     },
        // ];
    }
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
    const location = await geocoder
        .forwardGeocode({
            query: req.body.landmark.location,
            limit: 1,
        })
        .send();
    req.body.landmark.geometry = location.body.features[0].geometry;

    const landmark = await Landmark.findByIdAndUpdate(
        req.params.lmid,
        req.body.landmark
    );

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await landmark.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
        landmark.save();
    }

    req.flash("success", "Landmark updated.");
    res.redirect(`/landmarks/${req.params.lmid}`);
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
