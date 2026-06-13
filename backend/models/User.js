const mongoose = require('mongoose');
const { compileModel } = require('../config/db');

const schemaDef = {
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
};

const userSchema = new mongoose.Schema(schemaDef, { timestamps: true });

module.exports = compileModel('User', schemaDef, userSchema);
