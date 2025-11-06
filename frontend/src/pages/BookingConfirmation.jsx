import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { hotelsAPI, roomsAPI, bookingsAPI } from '../services/api.js';

const BookingConfirmation = () => {
  const { hotelId, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  const [bookingData, setBookingData] = useState({
    hotelId,
    roomId,
    checkIn,
    checkOut
  });

  useEffect(() => {
    if (!checkIn || !checkOut) {
      navigate('/');
      return;
    }

    fetchBookingDetails();
  }, [hotelId, roomId, checkIn, checkOut, navigate]);

  const fetchBookingDetails = async () => {
    try {
      const [hotelResponse, roomResponse] = await Promise.all([
        hotelsAPI.getHotelById(hotelId),
        roomsAPI.getRoomById(roomId)
      ]);

      setHotel(hotelResponse.data.hotel);
      setRoom(roomResponse.data.room);
    } catch (err) {
      setError(err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!room || !checkIn || !checkOut) return 0;

    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    return nights * room.pricePerNight;
  };

  const handleConfirmBooking = async () => {
    if (!hotel || !room) return;

    const confirmation = window.confirm(
      `Are you sure you want to book ${room.name} at ${hotel.name} for $${calculateTotalPrice()}?`
    );

    if (!confirmation) return;

    setIsSubmitting(true);

    try {
      const response = await bookingsAPI.createBooking(bookingData);

      alert('Booking confirmed successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="loading"></div>
        <p className="mt-3">Loading booking details...</p>
      </div>
    );
  }

  if (error || !hotel || !room) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          {error || 'Booking details not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Hotels
        </button>
      </div>
    );
  }

  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = calculateTotalPrice();

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-center">
              <h3>Booking Confirmation</h3>
              <p className="text-muted">Please review your booking details</p>
            </div>
            <div className="card-body">
              {/* Hotel Details */}
              <div className="card mb-3">
                <div className="card-body">
                  <h5>Hotel Details</h5>
                  <h6>{hotel.name}</h6>
                  <p className="text-muted">
                    <i className="fas fa-map-marker-alt"></i> {hotel.location}
                  </p>
                  <p className="text-muted">
                    <i className="fas fa-building"></i> {hotel.address}
                  </p>
                </div>
              </div>

              {/* Room Details */}
              <div className="card mb-3">
                <div className="card-body">
                  <h5>Room Details</h5>
                  <h6>{room.name}</h6>
                  <p className="text-muted">
                    Type: {room.type} | Capacity: {room.capacity} guests
                  </p>
                  <div className="d-flex justify-content-between">
                    <span>Price per night:</span>
                    <strong>${room.pricePerNight}</strong>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="card mb-3">
                <div className="card-body">
                  <h5>Booking Details</h5>
                  <div className="row mb-2">
                    <div className="col-6">
                      <strong>Check-in:</strong>
                    </div>
                    <div className="col-6">
                      {formatDate(checkIn)}
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-6">
                      <strong>Check-out:</strong>
                    </div>
                    <div className="col-6">
                      {formatDate(checkOut)}
                    </div>
                  </div>
                  <div className="row mb-2">
                    <div className="col-6">
                      <strong>Number of nights:</strong>
                    </div>
                    <div className="col-6">
                      {nights}
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-6">
                      <h5>Total Price:</h5>
                    </div>
                    <div className="col-6 text-right">
                      <h5 className="text-primary">${totalPrice}</h5>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="alert alert-info">
                <h6>Important Information:</h6>
                <ul className="mb-0">
                  <li>Check-in time: 2:00 PM</li>
                  <li>Check-out time: 11:00 AM</li>
                  <li>Free cancellation up to 24 hours before check-in</li>
                  <li>Payment will be processed at the hotel</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading" style={{
                        width: '16px',
                        height: '16px',
                        marginRight: '8px',
                        border: '2px solid #fff',
                        borderTop: '2px solid transparent'
                      }}></span>
                      Confirming Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/hotel/${hotelId}`)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;