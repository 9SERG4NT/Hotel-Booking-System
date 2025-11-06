import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required']
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Check-in date cannot be in the past'
    }
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(value) {
        return value > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled'],
      message: 'Status must be pending, confirmed, or cancelled'
    },
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration in nights
bookingSchema.virtual('duration').get(function() {
  const timeDiff = this.checkOut.getTime() - this.checkIn.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for populated related data
bookingSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

bookingSchema.virtual('hotel', {
  ref: 'Hotel',
  localField: 'hotelId',
  foreignField: '_id',
  justOne: true
});

bookingSchema.virtual('room', {
  ref: 'Room',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true
});

// Index for search functionality
bookingSchema.index({ userId: 1 });
bookingSchema.index({ hotelId: 1 });
bookingSchema.index({ roomId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });

// Compound index to prevent double bookings for the same room and dates
bookingSchema.index(
  { roomId: 1, checkIn: 1, checkOut: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'confirmed'] }
    }
  }
);

// Ensure user, hotel, and room exist before saving booking
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const Hotel = mongoose.model('Hotel');
    const Room = mongoose.model('Room');

    const [user, hotel, room] = await Promise.all([
      User.findById(this.userId),
      Hotel.findById(this.hotelId),
      Room.findById(this.roomId)
    ]);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (!hotel) {
      const error = new Error('Hotel not found');
      error.statusCode = 404;
      return next(error);
    }

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      return next(error);
    }

    if (!room.isAvailable) {
      const error = new Error('Room is not available');
      error.statusCode = 400;
      return next(error);
    }

    // Check if room belongs to the specified hotel
    if (room.hotelId.toString() !== this.hotelId.toString()) {
      const error = new Error('Room does not belong to the specified hotel');
      error.statusCode = 400;
      return next(error);
    }

    // Check if room is already booked for the requested dates
    const existingBooking = await this.constructor.findOne({
      roomId: this.roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          checkIn: { $lt: this.checkOut },
          checkOut: { $gt: this.checkIn }
        }
      ]
    });

    if (existingBooking) {
      const error = new Error('Room is already booked for the selected dates');
      error.statusCode = 409;
      return next(error);
    }

    // Calculate total price if not provided
    if (!this.totalPrice) {
      const nights = Math.ceil((this.checkOut - this.checkIn) / (1000 * 3600 * 24));
      this.totalPrice = nights * room.pricePerNight;
    }
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);