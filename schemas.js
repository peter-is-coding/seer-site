const Joi = require('joi');

const landmarkSchema = Joi.object({
    landmark: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        image: Joi.string().empty(''),
        description: Joi.string().empty(''),
    }).required()
});

module.exports.landmarkSchema = landmarkSchema;