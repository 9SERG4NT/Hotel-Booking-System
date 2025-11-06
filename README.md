# Hotel Booking System

A complete full-stack hotel booking application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring user authentication, hotel management, room booking, and admin dashboard.

## Features

### 🔐 User Authentication
- User registration and login with JWT
- Protected routes and middleware
- Role-based access (Guest/Admin)
- Password hashing with bcrypt

### 🏨 Hotel Management
- Browse hotels with search and filtering
- View hotel details and images
- Search by location, price range, and rating
- Admin functions to add/edit/delete hotels

### 🛏️ Room Booking
- View available rooms for each hotel
- Check room availability for specific dates
- Create bookings with date validation
- Cancel bookings with restrictions
- Booking status management

### 👤 User Dashboard
- View personal profile information
- Manage bookings (view/cancel)
- Booking history and status tracking

### 🔧 Admin Dashboard
- Manage all hotels and rooms
- View and manage all bookings
- Update booking statuses
- System statistics and overview

## Tech Stack

- **Frontend**: React, React Router, Axios, CSS3
- **Backend**: Node.js, Express.js, JWT, bcryptjs
- **Database**: MongoDB with Mongoose ODM
- **Development**: Vite, nodemon

## Project Structure

```
Hotel-Booking-System/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── hotelController.js    # Hotel management logic
│   │   ├── roomController.js     # Room management logic
│   │   └── bookingController.js  # Booking logic
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema and model
│   │   ├── Hotel.js              # Hotel schema and model
│   │   ├── Room.js               # Room schema and model
│   │   └── Booking.js            # Booking schema and model
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   ├── hotelRoutes.js        # Hotel endpoints
│   │   ├── roomRoutes.js         # Room endpoints
│   │   └── bookingRoutes.js      # Booking endpoints
│   ├── utils/
│   │   └── generateToken.js      # JWT token generation
│   ├── server.js                 # Express server setup
│   ├── .env.example              # Environment variables template
│   └── package.json              # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx # Route protection component
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Signup.jsx         # Registration page
│   │   │   ├── Home.jsx           # Hotel listings page
│   │   │   ├── HotelDetails.jsx   # Hotel details page
│   │   │   ├── BookingConfirmation.jsx # Booking confirmation page
│   │   │   ├── Dashboard.jsx      # User dashboard
│   │   │   └── AdminDashboard.jsx # Admin dashboard
│   │   ├── services/
│   │   │   └── api.js             # API service with Axios
│   │   ├── App.jsx                # Main app component with routing
│   │   ├── main.jsx               # App entry point
│   │   └── index.css              # Global styles
│   ├── .env.example               # Environment variables template
│   ├── index.html                 # HTML template
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite configuration
└── README.md                      # This file
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (running locally or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Hotel-Booking-System
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
```

#### Backend Environment Variables
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hotel-booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup
- Make sure MongoDB is running on your system
- Or use MongoDB Atlas and update the `MONGODB_URI` in backend/.env

### 5. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### Start Frontend Application
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## Usage

### As a Guest User
1. **Browse Hotels**: Visit the homepage to search and browse hotels
2. **Register Account**: Click "Sign Up" to create a new account
3. **Login**: Use your credentials to access the system
4. **Book Hotels**: View hotel details and book rooms with selected dates

### As an Admin User
1. **Admin Access**: Register with any email and manually set role to 'admin' in the database
2. **Admin Dashboard**: Access admin panel to manage hotels, rooms, and bookings
3. **Management**: Add/edit hotels, manage room inventory, update booking statuses

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Hotels
- `GET /api/hotels` - Get all hotels (with search/filter)
- `GET /api/hotels/:id` - Get hotel details with rooms
- `POST /api/hotels` - Create hotel (admin only)
- `PUT /api/hotels/:id` - Update hotel (admin only)
- `DELETE /api/hotels/:id` - Delete hotel (admin only)
- `POST /api/hotels/availability` - Check room availability

### Rooms
- `GET /api/rooms/hotel/:hotelId` - Get rooms for a hotel
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/admin/all` - Get all bookings (admin only)

## Features Implementation

### Authentication Flow
1. User registers/logs in with email and password
2. Server validates credentials and returns JWT token
3. Token stored in localStorage and sent with subsequent requests
4. Protected routes require valid JWT token

### Booking Flow
1. User searches and browses hotels
2. User selects hotel and available room
3. User selects check-in and check-out dates
4. System checks room availability
5. User confirms booking details
6. Booking created with pending status
7. Admin can confirm or cancel bookings

### Admin Functions
- View system statistics
- Manage all bookings and update statuses
- Hotel and room management (basic implementation)
- User management capabilities

## Security Features

- JWT-based authentication with 24-hour expiration
- Password hashing with bcrypt (10 salt rounds)
- Protected API routes with middleware
- Input validation and sanitization
- CORS configuration
- Rate limiting on API endpoints
- Admin role-based access control

## Error Handling

- Comprehensive error handling on both frontend and backend
- User-friendly error messages
- Form validation with immediate feedback
- Network error handling
- API timeout handling

## Future Enhancements

- Hotel and room image uploads
- Advanced search with map integration
- Payment processing integration
- Email notifications for booking confirmations
- Review and rating system
- Advanced admin analytics
- Multi-language support
- Mobile responsive design improvements

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, please open an issue in the repository or contact the development team.