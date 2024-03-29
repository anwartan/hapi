const Joi = require('joi');

const MusicPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(2021)
    .required(),
  performer: Joi.string().required(),
  genre: Joi.string(),
  duration: Joi.number(),

});

module.exports = { MusicPayloadSchema };
