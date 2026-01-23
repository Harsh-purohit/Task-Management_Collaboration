import Joi from "joi";

export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  email: Joi.string().email().optional(),
  oldPassword: Joi.string().optional(),
  newPassword: Joi.string().optional(),
}).min(1);
