const Joi = require("joi");

// const userSchema = Joi.object({
//     username: Joi.string().required(),
// });

const landmarkSchema = Joi.object({
    landmark: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().empty(""),
    }).required(),
    deleteImages: Joi.array(),
});

const reviewSchema = Joi.object({
    review: Joi.object({
        text: Joi.string().empty(""),
        rating: Joi.number().min(0).max(5).required(),
    }).required(),
});

module.exports.landmarkSchema = landmarkSchema;
module.exports.reviewSchema = reviewSchema;
