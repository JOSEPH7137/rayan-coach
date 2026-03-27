const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  registration: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  type: { type: String, enum: ['standard', 'vip', 'express'], default: 'standard' },
  capacity: { type: Number, required: true },
  amenities: [String],
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  images: [String],
  insuranceExpiry: { type: Date, required: true },
  inspectionExpiry: { type: Date, required: true },
  lastService: Date,
  nextService: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);