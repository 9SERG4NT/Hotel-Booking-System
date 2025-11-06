import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingsAPI } from '../services/api.js';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getBookings();
      setBookings(response.data.bookings);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsAPI.cancelBooking(bookingId);
        fetchBookings(); // Refresh bookings
      } catch (err) {
        alert(err.message || 'Failed to cancel booking');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="loading"></div>
        <p className="mt-3">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Welcome, {user?.name}!</h2>
          <p className="text-muted">Manage your hotel bookings from here</p>
        </div>
        <div className="col-md-4 text-right">
          <Link to="/" className="btn btn-primary me-2">
            Browse Hotels
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn btn-secondary">
              Admin Panel
            </Link>
          )}
        </div>
      </div>

      {/* User Profile Card */}
      <div className="card mb-4">
        <div className="card-body">
          <h4>Your Profile</h4>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Member since:</strong> {formatDate(user?.createdAt)}</p>
        </div>
      </div>

      {/* Bookings Section */}
      <div className="card">
        <div className="card-header">
          <h4>Your Bookings</h4>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="text-center py-4">
              <h5>No bookings yet</h5>
              <p className="text-muted">Start by browsing and booking hotels</p>
              <Link to="/" className="btn btn-primary">
                Browse Hotels
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Hotel</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.hotelId?.name}</td>
                      <td>{booking.roomId?.name}</td>
                      <td>{formatDate(booking.checkIn)}</td>
                      <td>{formatDate(booking.checkOut)}</td>
                      <td>${booking.totalPrice}</td>
                      <td>
                        <span className={`badge bg-${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {booking.status !== 'cancelled' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => cancelBooking(booking._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;