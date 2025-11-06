import express from 'express';
import {
  getRoomsByHotel,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/rooms/hotel/:hotelId
// @desc    Get rooms for a specific hotel
// @access  Public
router.get('/hotel/:hotelId', getRoomsByHotel);

// @route   GET /api/rooms/:id
// @desc    Get single room by ID
// @access  Public
router.get('/:id', getRoomById);

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private/Admin
router.post('/', protect, admin, createRoom);

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private/Admin
router.put('/:id', protect, admin, updateRoom);

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteRoom);

export default router;