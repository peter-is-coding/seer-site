const baseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// const userSchema = Joi.object({
//     username: Joi.string().required(),
// });

const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!",
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) {
                    return helpers.error("string.escapeHTML", { value });
                } else {
                    return clean;
                }
            },
        },
    },
});

const Joi = baseJoi.extend(extension);

const landmarkSchema = Joi.object({
    landmark: Joi.object({
        title: Joi.string().escapeHTML().required(),
        location: Joi.string().escapeHTML().required(),
        description: Joi.string().escapeHTML().empty(""),
    }).required(),
    deleteImages: Joi.array(),
});

const reviewSchema = Joi.object({
    review: Joi.object({
        text: Joi.string().escapeHTML().empty(""),
        rating: Joi.number().min(0).max(5).required(),
    }).required(),
});

module.exports.landmarkSchema = landmarkSchema;
module.exports.reviewSchema = reviewSchema;
