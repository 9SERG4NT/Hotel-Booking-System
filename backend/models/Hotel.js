import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    minlength: [2, 'Hotel name must be at least 2 characters long'],
    maxlength: [100, 'Hotel name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Hotel description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Hotel location is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Hotel address is required'],
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: [1, 'Rating cannot be less than 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 3
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rooms associated with this hotel
hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotelId'
});

// Index for search functionality
hotelSchema.index({ name: 'text', location: 'text', description: 'text' });
hotelSchema.index({ location: 1 });
hotelSchema.index({ rating: 1 });

export default mongoose.model('Hotel', hotelSchema);