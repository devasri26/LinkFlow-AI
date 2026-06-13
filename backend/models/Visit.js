const mongoose = require('mongoose');
const { compileModel } = require('../config/db');

const schemaDef = {
  urlId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String, default: '' },
  device: { type: String, default: 'Desktop' },
  browser: { type: String, default: 'Unknown' },
  os: { type: String, default: 'Unknown' },
  country: { type: String, default: 'Local' }
};

const visitSchema = new mongoose.Schema(schemaDef, { timestamps: true });

module.exports = compileModel('Visit', schemaDef, visitSchema);
