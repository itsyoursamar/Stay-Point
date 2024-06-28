const Joi=require("joi");
const review = require("./models/review");
// for server side validation

module.exports.listingSchema=Joi.object({
    listing:Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        category: Joi.string().required(),
        contact:{ 
            ph_no: Joi.string().pattern(/^\d{10}$/).messages({
                'string.pattern.base': 'Phone number must be a 10-digit number'
              }),
            house_no: Joi.string().required(),
            house_location: Joi.string().required(),
        },
     
    }).required()
});

module.exports.reviewSchema=Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
});



