const mongoose = require('mongoose');
const { compileModel } = require('../config/db');

const schemaDef = {
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  customAlias: { type: String, default: null },
  title: { type: String, default: '' },
  userId: { type: String, default: null },
  clicks: { type: Number, default: 0 },
  expiryDate: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
};

const urlSchema = new mongoose.Schema(schemaDef, { timestamps: true });

module.exports = compileModel('Url', schemaDef, urlSchema);
