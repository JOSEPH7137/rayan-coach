const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');

const router = express.Router();

router.use(protect);
router.use(authorize('driver'));

// Get driver profile
router.get('/profile', async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id })
      .populate('assignedVehicle')
      .populate('user', 'name email phone');
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver profile
router.put('/profile', async (req, res) => {
  try {
    const { licenseNumber, licenseExpiry, psvBadge, psvExpiry } = req.body;
    const driver = await Driver.findOne({ user: req.user._id });

    if (licenseNumber) driver.licenseNumber = licenseNumber;
    if (licenseExpiry) driver.licenseExpiry = licenseExpiry;
    if (psvBadge) driver.psvBadge = psvBadge;
    if (psvExpiry) driver.psvExpiry = psvExpiry;

    await driver.save();
    res.json({ message: 'Profile updated', driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get assigned trips
router.get('/trips', async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    const trips = await Trip.find({ driver: driver._id })
      .populate('vehicle')
      .sort({ departureTime: 1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update trip status
router.put('/trips/:tripId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const driver = await Driver.findOne({ user: req.user._id });
    const trip = await Trip.findOne({ _id: req.params.tripId, driver: driver._id });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.status = status;
    await trip.save();

    res.json({ message: 'Trip status updated', trip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update location
router.post('/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const driver = await Driver.findOne({ user: req.user._id });

    driver.currentLocation = { lat, lng, updatedAt: new Date() };
    await driver.save();

    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clock in
router.post('/attendance/clock-in', async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    const today = new Date().toDateString();

    const existingAttendance = driver.attendance.find(a => 
      new Date(a.date).toDateString() === today
    );

    if (existingAttendance && existingAttendance.clockIn) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }

    if (existingAttendance) {
      existingAttendance.clockIn = new Date();
    } else {
      driver.attendance.push({ date: new Date(), clockIn: new Date() });
    }

    driver.status = 'available';
    await driver.save();

    res.json({ message: 'Clocked in successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clock out
router.post('/attendance/clock-out', async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user._id });
    const today = new Date().toDateString();

    const attendance = driver.attendance.find(a => 
      new Date(a.date).toDateString() === today
    );

    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ message: 'Not clocked in yet' });
    }

    attendance.clockOut = new Date();
    const hours = (attendance.clockOut - attendance.clockIn) / (1000 * 60 * 60);
    attendance.hoursWorked = hours;

    driver.status = 'off-duty';
    await driver.save();

    res.json({ message: 'Clocked out successfully', hoursWorked: hours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;