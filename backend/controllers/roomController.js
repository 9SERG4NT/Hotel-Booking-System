import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

// @desc    Get rooms for a specific hotel
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
const getRoomsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { type, minPrice, maxPrice, capacity } = req.query;

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid hotel ID'
      });
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    // Build query
    let query = { hotelId, isAvailable: true };

    // Filter by room type
    if (type) {
      query.type = type;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerNight.$lte = parseFloat(maxPrice);
    }

    // Filter by capacity
    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    const rooms = await Room.find(query).sort({ pricePerNight: 1 });

    res.json({
      success: true,
      hotel: {
        id: hotel._id,
        name: hotel.name,
        location: hotel.location
      },
      rooms
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching rooms'
    });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID'
      });
    }

    const room = await Room.findById(id).populate('hotelId', 'name location address image');

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching room'
    });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  try {
    const {
      hotelId,
      name,
      type,
      capacity,
      pricePerNight,
      image,
      amenities,
      isAvailable
    } = req.body;

    // Validation
    if (!hotelId || !name || !type || !capacity || !pricePerNight) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid hotel ID'
      });
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Room name must be between 2 and 100 characters'
      });
    }

    if (!['single', 'double', 'suite'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Room type must be single, double, or suite'
      });
    }

    if (capacity < 1 || capacity > 10) {
      return res.status(400).json({
        success: false,
        error: 'Capacity must be between 1 and 10'
      });
    }

    if (pricePerNight < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price per night cannot be negative'
      });
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    const room = await Room.create({
      hotelId,
      name,
      type,
      capacity,
      pricePerNight,
      image: image || '',
      amenities: amenities || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    // Populate hotel info for response
    await room.populate('hotelId', 'name location');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating room'
    });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      capacity,
      pricePerNight,
      image,
      amenities,
      isAvailable
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID'
      });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Validation
    if (name && (name.length < 2 || name.length > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Room name must be between 2 and 100 characters'
      });
    }

    if (type && !['single', 'double', 'suite'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Room type must be single, double, or suite'
      });
    }

    if (capacity && (capacity < 1 || capacity > 10)) {
      return res.status(400).json({
        success: false,
        error: 'Capacity must be between 1 and 10'
      });
    }

    if (pricePerNight !== undefined && pricePerNight < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price per night cannot be negative'
      });
    }

    // Check if room has active bookings before making it unavailable
    if (isAvailable === false && room.isAvailable === true) {
      const activeBookings = await Booking.countDocuments({
        roomId: id,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot make room unavailable while it has active bookings'
        });
      }
    }

    // Update fields
    if (name) room.name = name;
    if (type) room.type = type;
    if (capacity) room.capacity = capacity;
    if (pricePerNight !== undefined) room.pricePerNight = pricePerNight;
    if (image !== undefined) room.image = image;
    if (amenities) room.amenities = amenities;
    if (isAvailable !== undefined) room.isAvailable = isAvailable;

    const updatedRoom = await room.save();
    await updatedRoom.populate('hotelId', 'name location');

    res.json({
      success: true,
      message: 'Room updated successfully',
      room: updatedRoom
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating room'
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room ID'
      });
    }

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    // Check if room has active bookings
    const activeBookings = await Booking.countDocuments({
      roomId: id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete room with active bookings'
      });
    }

    await Room.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting room'
    });
  }
};

export {
  getRoomsByHotel,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};