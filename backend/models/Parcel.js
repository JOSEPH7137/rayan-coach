const mongoose = require('mongoose');

const ParcelSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  sender: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String
  },
  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  pickupLocation: { type: String, required: true },
  deliveryLocation: { type: String, required: true },
  size: { type: String, enum: ['small', 'medium', 'large'], required: true },
  weight: { type: Number, required: true },
  description: String,
  deliveryType: { type: String, enum: ['same-day', 'next-day'], default: 'next-day' },
  status: { type: String, enum: ['pending', 'picked-up', 'in-transit', 'delivered', 'cancelled'], default: 'pending' },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  fare: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: Date
});

module.exports = mongoose.model('Parcel', ParcelSchema);