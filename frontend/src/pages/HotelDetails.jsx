import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hotelsAPI, roomsAPI } from '../services/api.js';

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [dates, setDates] = useState({
    checkIn: '',
    checkOut: ''
  });

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  const fetchHotelDetails = async () => {
    try {
      const response = await hotelsAPI.getHotelById(id);
      setHotel(response.data.hotel);
      setRooms(response.data.rooms);
    } catch (err) {
      setError(err.message || 'Failed to fetch hotel details');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDates(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkAvailability = async (roomId) => {
    if (!dates.checkIn || !dates.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }

    if (new Date(dates.checkIn) >= new Date(dates.checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    try {
      const response = await hotelsAPI.checkAvailability({
        hotelId: id,
        roomId,
        checkIn: dates.checkIn,
        checkOut: dates.checkOut
      });

      if (response.data.available) {
        window.location.href = `/booking/${id}/${roomId}?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}`;
      } else {
        alert('Room is not available for selected dates');
      }
    } catch (err) {
      alert(err.message || 'Failed to check availability');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < Math.floor(rating)) {
        stars.push(<span key={i} style={{ color: '#ffc107' }}>★</span>);
      } else {
        stars.push(<span key={i} style={{ color: '#ddd' }}>☆</span>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="loading"></div>
        <p className="mt-3">Loading hotel details...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          {error || 'Hotel not found'}
        </div>
        <Link to="/" className="btn btn-primary">
          Back to Hotels
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="mb-4">
        <Link to="/" className="btn btn-outline">
          ← Back to Hotels
        </Link>
      </div>

      {/* Hotel Header */}
      <div className="card mb-4">
        <div className="row">
          <div className="col-md-4">
            {hotel.image ? (
              <img
                src={hotel.image}
                alt={hotel.name}
                style={{
                  width: '100%',
                  height: '250px',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '250px',
                backgroundColor: '#e9ecef',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6c757d'
              }}>
                No Image Available
              </div>
            )}
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <h2>{hotel.name}</h2>
              <p className="text-muted">
                <i className="fas fa-map-marker-alt"></i> {hotel.location}
              </p>
              <p className="text-muted">
                <i className="fas fa-building"></i> {hotel.address}
              </p>

              <div className="mb-3">
                {renderStars(hotel.rating)}
                <span className="ms-2">({hotel.rating} stars)</span>
              </div>

              <p>{hotel.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div className="card mb-4">
        <div className="card-body">
          <h4>Select Dates</h4>
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Check-in Date</label>
              <input
                type="date"
                name="checkIn"
                className="form-control"
                value={dates.checkIn}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Check-out Date</label>
              <input
                type="date"
                name="checkOut"
                className="form-control"
                value={dates.checkOut}
                onChange={handleDateChange}
                min={dates.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Rooms */}
      <div className="card">
        <div className="card-header">
          <h4>Available Rooms ({rooms.length})</h4>
        </div>
        <div className="card-body">
          {rooms.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No rooms available at this hotel</p>
            </div>
          ) : (
            <div className="row">
              {rooms.map((room) => (
                <div key={room._id} className="col-md-6 mb-4">
                  <div className="card">
                    {room.image ? (
                      <img
                        src={room.image}
                        alt={room.name}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6c757d'
                      }}>
                        No Image Available
                      </div>
                    )}

                    <div className="card-body">
                      <h5>{room.name}</h5>
                      <p className="text-muted">
                        Type: {room.type} | Capacity: {room.capacity} guests
                      </p>

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="mb-2">
                          <small className="text-muted">
                            Amenities: {room.amenities.join(', ')}
                          </small>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-primary">
                            ${room.pricePerNight}
                          </span>
                          <span className="text-muted">/night</span>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() => checkAvailability(room._id)}
                          disabled={!dates.checkIn || !dates.checkOut}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;