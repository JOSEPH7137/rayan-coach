const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  licenseNumber: { type: String, required: true },
  licenseExpiry: { type: Date, required: true },
  psvBadge: { type: String, required: true },
  psvExpiry: { type: Date, required: true },
  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  status: { type: String, enum: ['available', 'busy', 'off-duty', 'suspended'], default: 'off-duty' },
  rating: { type: Number, default: 0 },
  totalTrips: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  attendance: [{
    date: { type: Date, default: Date.now },
    clockIn: Date,
    clockOut: Date,
    hoursWorked: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Driver', DriverSchema);