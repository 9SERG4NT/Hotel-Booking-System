import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import mongoose from 'mongoose';

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // Build query
    let query = { userId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .populate('hotelId', 'name location address image')
      .populate('roomId', 'name type capacity pricePerNight image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching bookings'
    });
  }
};

// @desc    Get all bookings (admin only)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const { status, hotelId, userId, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by hotel if provided
    if (hotelId) {
      query.hotelId = hotelId;
    }

    // Filter by user if provided
    if (userId) {
      query.userId = userId;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .populate('userId', 'name email')
      .populate('hotelId', 'name location address')
      .populate('roomId', 'name type capacity pricePerNight')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching all bookings'
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id)
      .populate('hotelId', 'name location address image')
      .populate('roomId', 'name type capacity pricePerNight image amenities');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching booking'
    });
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { hotelId, roomId, checkIn, checkOut } = req.body;
    const userId = req.user.id;

    // Validation
    if (!hotelId || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(hotelId) || !mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid hotel or room ID'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        error: 'Check-out date must be after check-in date'
      });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Check-in date cannot be in the past'
      });
    }

    // Check if hotel and room exist
    const [hotel, room] = await Promise.all([
      Hotel.findById(hotelId),
      Room.findById(roomId)
    ]);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        error: 'Room is not available'
      });
    }

    // Check if room belongs to the specified hotel
    if (room.hotelId.toString() !== hotelId) {
      return res.status(400).json({
        success: false,
        error: 'Room does not belong to the specified hotel'
      });
    }

    // Check if room is already booked for the requested dates
    const existingBooking = await Booking.findOne({
      roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        error: 'Room is already booked for the selected dates'
      });
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 3600 * 24));
    const totalPrice = nights * room.pricePerNight;

    // Create booking
    const booking = await Booking.create({
      userId,
      hotelId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      status: 'pending'
    });

    // Populate related data for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hotelId', 'name location address')
      .populate('roomId', 'name type capacity pricePerNight');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating booking'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }

    // Check if it's too late to cancel (within 24 hours of check-in)
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const timeDiff = checkInDate - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 24 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel booking within 24 hours of check-in'
      });
    }

    // Cancel booking
    booking.status = 'cancelled';
    await booking.save();

    // Populate related data for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hotelId', 'name location address')
      .populate('roomId', 'name type capacity pricePerNight');

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while cancelling booking'
    });
  }
};

// @desc    Update booking status (admin only)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid booking ID'
      });
    }

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, confirmed, or cancelled'
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    // Populate related data for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hotelId', 'name location address')
      .populate('roomId', 'name type capacity pricePerNight')
      .populate('userId', 'name email');

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating booking status'
    });
  }
};

export {
  getBookings,
  getAllBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  updateBookingStatus
};