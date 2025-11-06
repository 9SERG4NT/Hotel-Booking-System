import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

// @desc    Get all hotels with optional search and filters
// @route   GET /api/hotels
// @access  Public
const getHotels = async (req, res) => {
  try {
    const {
      search,
      location,
      minPrice,
      maxPrice,
      minRating,
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = {};

    // Search by name, location, or description
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Calculate average room price for price filtering
    let hotels;
    if (minPrice || maxPrice) {
      // Aggregate to get average room price per hotel
      const priceMatch = {};
      if (minPrice) priceMatch.$gte = parseFloat(minPrice);
      if (maxPrice) priceMatch.$lte = parseFloat(maxPrice);

      const hotelIdsWithPriceRange = await Room.aggregate([
        {
          $match: {
            isAvailable: true,
            pricePerNight: priceMatch
          }
        },
        {
          $group: {
            _id: '$hotelId',
            avgPrice: { $avg: '$pricePerNight' }
          }
        }
      ]);

      const hotelIds = hotelIdsWithPriceRange.map(item => item._id);
      query._id = { $in: hotelIds };
    }

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    hotels = await Hotel.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ rating: -1, createdAt: -1 })
      .lean();

    // Get count for pagination
    const total = await Hotel.countDocuments(query);

    // Get room count and min/max prices for each hotel
    const hotelsWithRoomInfo = await Promise.all(
      hotels.map(async (hotel) => {
        const roomStats = await Room.aggregate([
          { $match: { hotelId: hotel._id, isAvailable: true } },
          {
            $group: {
              _id: null,
              roomCount: { $sum: 1 },
              minPrice: { $min: '$pricePerNight' },
              maxPrice: { $max: '$pricePerNight' }
            }
          }
        ]);

        const stats = roomStats[0] || { roomCount: 0, minPrice: 0, maxPrice: 0 };

        return {
          ...hotel,
          roomCount: stats.roomCount,
          minPrice: stats.minPrice,
          maxPrice: stats.maxPrice
        };
      })
    );

    res.json({
      success: true,
      hotels: hotelsWithRoomInfo,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching hotels'
    });
  }
};

// @desc    Get single hotel by ID with its rooms
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid hotel ID'
      });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    // Get available rooms for this hotel
    const rooms = await Room.find({
      hotelId: id,
      isAvailable: true
    }).sort({ pricePerNight: 1 });

    res.json({
      success: true,
      hotel,
      rooms
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching hotel'
    });
  }
};

// @desc    Create a new hotel
// @route   POST /api/hotels
// @access  Private/Admin
const createHotel = async (req, res) => {
  try {
    const { name, description, location, address, rating, image } = req.body;

    // Validation
    if (!name || !description || !location || !address) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Hotel name must be between 2 and 100 characters'
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Description cannot exceed 1000 characters'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    const hotel = await Hotel.create({
      name,
      description,
      location,
      address,
      rating: rating || 3,
      image: image || ''
    });

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      hotel
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating hotel'
    });
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private/Admin
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location, address, rating, image } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid hotel ID'
      });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    // Validation
    if (name && (name.length < 2 || name.length > 100)) {
      return res.status(400).json({
        success: false,
        error: 'Hotel name must be between 2 and 100 characters'
      });
    }

    if (description && description.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Description cannot exceed 1000 characters'
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Update fields
    if (name) hotel.name = name;
    if (description) hotel.description = description;
    if (location) hotel.location = location;
    if (address) hotel.address = address;
    if (rating !== undefined) hotel.rating = rating;
    if (image !== undefined) hotel.image = image;

    const updatedHotel = await hotel.save();

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      hotel: updatedHotel
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating hotel'
    });
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid hotel ID'
      });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    // Check if hotel has any active bookings
    const activeBookings = await Booking.countDocuments({
      hotelId: id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete hotel with active bookings'
      });
    }

    // Delete associated rooms
    await Room.deleteMany({ hotelId: id });

    // Delete hotel
    await Hotel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Hotel and associated rooms deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting hotel'
    });
  }
};

// @desc    Check room availability for dates
// @route   POST /api/hotels/availability
// @access  Public
const checkRoomAvailability = async (req, res) => {
  try {
    const { hotelId, roomId, checkIn, checkOut } = req.body;

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Please provide hotelId, checkIn, and checkOut dates'
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

    let query = {
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ]
    };

    if (roomId) {
      query.roomId = roomId;
    } else {
      query.hotelId = hotelId;
    }

    const conflictingBookings = await Booking.find(query);

    // Get total available rooms
    const totalRoomsQuery = roomId
      ? { _id: roomId, isAvailable: true }
      : { hotelId, isAvailable: true };

    const totalRooms = await Room.countDocuments(totalRoomsQuery);

    // Get unavailable room IDs
    const unavailableRoomIds = conflictingBookings.map(booking => booking.roomId.toString());
    const unavailableRoomCount = new Set(unavailableRoomIds).size;

    const availableRooms = totalRooms - unavailableRoomCount;

    res.json({
      success: true,
      available: availableRooms > 0,
      availableRooms,
      totalRooms,
      unavailableRoomCount,
      checkIn: checkInDate,
      checkOut: checkOutDate
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking availability'
    });
  }
};

export {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  checkRoomAvailability
};