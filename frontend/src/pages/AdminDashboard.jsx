import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { hotelsAPI, roomsAPI, bookingsAPI } from '../services/api.js';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [data, setData] = useState({
    hotels: [],
    rooms: [],
    bookings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsResponse] = await Promise.all([
        bookingsAPI.getAllBookings({ limit: 100 })
      ]);

      const bookings = bookingsResponse.data.bookings;

      // Calculate stats
      const totalRevenue = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalPrice, 0);

      setStats({
        totalHotels: new Set(bookings.map(b => b.hotelId?._id)).size,
        totalRooms: new Set(bookings.map(b => b.roomId?._id)).size,
        totalBookings: bookings.length,
        totalRevenue
      });

      setData({ bookings });
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.updateBookingStatus(bookingId, newStatus);
      fetchDashboardData(); // Refresh data
    } catch (err) {
      alert(err.message || 'Failed to update booking status');
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
        <p className="mt-3">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Manage hotels, rooms, and bookings</p>
        </div>
        <div className="col-md-4 text-right">
          <Link to="/dashboard" className="btn btn-outline me-2">
            User Dashboard
          </Link>
          <Link to="/" className="btn btn-primary">
            Browse Hotels
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 mb-4">
        <div className="card">
          <div className="card-body text-center">
            <h3 className="text-primary">{stats.totalHotels}</h3>
            <p className="text-muted">Total Hotels</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <h3 className="text-success">{stats.totalRooms}</h3>
            <p className="text-muted">Total Rooms</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <h3 className="text-warning">{stats.totalBookings}</h3>
            <p className="text-muted">Total Bookings</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <h3 className="text-info">${stats.totalRevenue.toFixed(2)}</h3>
            <p className="text-muted">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card mb-4">
        <div className="card-header">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                Bookings
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'hotels' ? 'active' : ''}`}
                onClick={() => setActiveTab('hotels')}
              >
                Hotels
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                Rooms
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <h5>System Overview</h5>
              <p>Welcome to the admin dashboard. Here you can manage all aspects of the hotel booking system.</p>
              <div className="row">
                <div className="col-md-6">
                  <h6>Quick Actions:</h6>
                  <ul>
                    <li><Link to="/">Browse all hotels</Link></li>
                    <li>View booking statistics</li>
                    <li>Manage user accounts</li>
                    <li>Generate reports</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Recent Activity:</h6>
                  <p className="text-muted">System is running normally</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h5>All Bookings</h5>
              {data.bookings.length === 0 ? (
                <p>No bookings found</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Hotel</th>
                        <th>Room</th>
                        <th>Dates</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>#{booking._id.slice(-6)}</td>
                          <td>{booking.userId?.name}</td>
                          <td>{booking.hotelId?.name}</td>
                          <td>{booking.roomId?.name}</td>
                          <td>
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </td>
                          <td>${booking.totalPrice}</td>
                          <td>
                            <span className={`badge bg-${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hotels' && (
            <div>
              <h5>Hotel Management</h5>
              <p>Hotel management features would be implemented here.</p>
              <p>Features include: Add/Edit/Delete hotels, manage hotel details, upload images, etc.</p>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div>
              <h5>Room Management</h5>
              <p>Room management features would be implemented here.</p>
              <p>Features include: Add/Edit/Delete rooms, manage room types, pricing, availability, etc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;