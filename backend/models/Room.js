import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required']
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    minlength: [2, 'Room name must be at least 2 characters long'],
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: {
      values: ['single', 'double', 'suite'],
      message: 'Room type must be single, double, or suite'
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Room capacity must be at least 1'],
    max: [10, 'Room capacity cannot exceed 10']
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price per night cannot be negative']
  },
  image: {
    type: String,
    default: ''
  },
  amenities: [{
    type: String,
    trim: true
  }],
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for bookings associated with this room
roomSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'roomId'
});

// Index for search functionality
roomSchema.index({ hotelId: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ pricePerNight: 1 });
roomSchema.index({ capacity: 1 });
roomSchema.index({ isAvailable: 1 });

// Ensure hotel exists before saving room
roomSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Hotel = mongoose.model('Hotel');
    const hotel = await Hotel.findById(this.hotelId);
    if (!hotel) {
      const error = new Error('Hotel not found');
      error.statusCode = 404;
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Room', roomSchema);