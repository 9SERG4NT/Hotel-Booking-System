import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  checkRoomAvailability
} from '../controllers/hotelController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/hotels
// @desc    Get all hotels with search and filters
// @access  Public
router.get('/', getHotels);

// @route   GET /api/hotels/search
// @desc    Search hotels (alias for GET /hotels with search query)
// @access  Public
router.get('/search', getHotels);

// @route   POST /api/hotels/availability
// @desc    Check room availability for dates
// @access  Public
router.post('/availability', checkRoomAvailability);

// @route   GET /api/hotels/:id
// @desc    Get single hotel by ID with rooms
// @access  Public
router.get('/:id', getHotelById);

// @route   POST /api/hotels
// @desc    Create a new hotel
// @access  Private/Admin
router.post('/', protect, admin, createHotel);

// @route   PUT /api/hotels/:id
// @desc    Update hotel
// @access  Private/Admin
router.put('/:id', protect, admin, updateHotel);

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteHotel);

export default router;