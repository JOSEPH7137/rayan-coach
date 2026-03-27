const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  route: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  fare: { type: Number, required: true },
  status: { type: String, enum: ['scheduled', 'en-route', 'completed', 'cancelled'], default: 'scheduled' },
  availableSeats: { type: Number, required: true },
  bookings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    seatNumber: String,
    class: String,
    fare: Number,
    bookingDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    paymentMethod: String,
    ticketNumber: String,
    qrCode: String
  }],
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);