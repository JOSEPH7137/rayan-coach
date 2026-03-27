const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Parcel = require('../models/Parcel');

const router = express.Router();

router.use(protect);
router.use(authorize('user'));

// Get profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const { name, phone, savedLocations } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (savedLocations) user.savedLocations = savedLocations;

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings
router.get('/bookings', async (req, res) => {
  try {
    const trips = await Trip.find({ 'bookings.user': req.user._id })
      .populate('vehicle')
      .populate('driver', 'licenseNumber')
      .sort({ departureTime: -1 });

    const bookings = trips.map(trip => ({
      tripId: trip._id,
      route: trip.route,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      status: trip.status,
      booking: trip.bookings.find(b => b.user.toString() === req.user._id)
    }));

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create booking
router.post('/bookings', async (req, res) => {
  try {
    const { tripId, seatNumber, passengerClass } = req.body;
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.availableSeats <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    const ticketNumber = `RC${Date.now()}${Math.floor(Math.random() * 1000)}`;

    trip.bookings.push({
      user: req.user._id,
      seatNumber,
      class: passengerClass,
      fare: trip.fare,
      paymentStatus: 'pending',
      ticketNumber
    });

    trip.availableSeats -= 1;
    await trip.save();

    res.json({ message: 'Booking created', ticketNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get parcels
router.get('/parcels', async (req, res) => {
  try {
    const parcels = await Parcel.find({
      $or: [
        { 'sender.email': req.user.email },
        { 'receiver.phone': req.user.phone }
      ]
    }).sort({ createdAt: -1 });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create parcel
router.post('/parcels', async (req, res) => {
  try {
    const trackingId = `RCP${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const parcel = await Parcel.create({
      ...req.body,
      trackingId,
      sender: { ...req.body.sender, email: req.user.email }
    });
    res.status(201).json(parcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;