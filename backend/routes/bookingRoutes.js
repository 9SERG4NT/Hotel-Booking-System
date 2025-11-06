import express from 'express';
import {
  getBookings,
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', protect, getBookings);

// @route   GET /api/bookings/admin/all
// @desc    Get all bookings (admin only)
// @access  Private/Admin
router.get('/admin/all', protect, admin, getAllBookings);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', protect, createBooking);

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private
router.get('/:id', protect, getBookingById);

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', protect, cancelBooking);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, updateBookingStatus);

export default router;