const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDrivers = await Driver.countDocuments();
    const activeDrivers = await Driver.countDocuments({ status: 'available' });
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ status: 'active' });
    const activeTrips = await Trip.countDocuments({ status: { $in: ['scheduled', 'en-route'] } });
    const todayRevenue = await Trip.aggregate([
      { $match: { departureTime: { $gte: new Date().setHours(0,0,0) } } },
      { $unwind: '$bookings' },
      { $match: { 'bookings.paymentStatus': 'paid' } },
      { $group: { _id: null, total: { $sum: '$bookings.fare' } } }
    ]);

    res.json({
      totalUsers,
      totalDrivers,
      activeDrivers,
      totalVehicles,
      activeVehicles,
      activeTrips,
      todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all drivers
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate('user', 'name email phone')
      .populate('assignedVehicle', 'registration model');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create driver
router.post('/drivers', async (req, res) => {
  try {
    const { name, email, phone, password, licenseNumber, licenseExpiry, psvBadge, psvExpiry } = req.body;

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'driver'
    });

    const driver = await Driver.create({
      user: user._id,
      licenseNumber,
      licenseExpiry,
      psvBadge,
      psvExpiry
    });

    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver
router.put('/drivers/:driverId', async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.driverId,
      req.body,
      { new: true }
    );
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete driver
router.delete('/drivers/:driverId', async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.driverId);
    await User.findByIdAndDelete(driver.user);
    res.json({ message: 'Driver deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('assignedDriver', 'licenseNumber');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create vehicle
router.post('/vehicles', async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update vehicle
router.put('/vehicles/:vehicleId', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.vehicleId,
      req.body,
      { new: true }
    );
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all trips
router.get('/trips', async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('vehicle')
      .populate('driver', 'licenseNumber')
      .sort({ departureTime: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create trip
router.post('/trips', async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update trip
router.put('/trips/:tripId', async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.tripId,
      req.body,
      { new: true }
    );
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;