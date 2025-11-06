import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelsAPI } from '../services/api.js';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Fetch hotels
  const fetchHotels = async (page = 1, searchParams = {}, filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: pagination.limit,
        ...searchParams,
        ...filterParams
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await hotelsAPI.getHotels(params);
      setHotels(response.data.hotels);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch hotels');
      console.error('Fetch hotels error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchHotels();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchHotels(1, { search: searchTerm }, filters);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchHotels(1, { search: searchTerm }, filters);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      minRating: ''
    });
    setSearchTerm('');
    fetchHotels(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchHotels(newPage, { search: searchTerm }, filters);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star-half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star-empty">☆</span>);
    }

    return stars;
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="container text-center mt-5">
        <div className="loading"></div>
        <p className="mt-3">Loading hotels...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="text-center mb-5">
        <h1>Find Your Perfect Stay</h1>
        <p className="text-muted">Discover and book hotels worldwide</p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-5">
        <div className="card-body">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="row">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search hotels by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Search Hotels
                </button>
              </div>
            </div>
          </form>

          {/* Filters */}
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="City or country"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  className="form-control"
                  placeholder="Min price/night"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  className="form-control"
                  placeholder="Max price/night"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  min="0"
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">Min Rating</label>
                <select
                  name="minRating"
                  className="form-control"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                >
                  <option value="">Any rating</option>
                  <option value="3">3+ stars</option>
                  <option value="4">4+ stars</option>
                  <option value="4.5">4.5+ stars</option>
                </select>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button onClick={applyFilters} className="btn btn-secondary">
              Apply Filters
            </button>
            <button onClick={clearFilters} className="btn btn-outline">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}

      {/* Hotels Grid */}
      {hotels.length === 0 && !loading ? (
        <div className="text-center py-5">
          <h3>No hotels found</h3>
          <p className="text-muted">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 grid-cols-2 grid-cols-3 grid-cols-4">
            {hotels.map((hotel) => (
              <div key={hotel._id} className="card">
                {/* Hotel Image */}
                {hotel.image ? (
                  <img
                    src={hotel.image}
                    alt={hotel.name}
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
                  <h5 className="card-title">{hotel.name}</h5>
                  <p className="text-muted mb-2">
                    <i className="fas fa-map-marker-alt"></i> {hotel.location}
                  </p>

                  {/* Rating */}
                  <div className="mb-2">
                    <span style={{ color: '#ffc107' }}>
                      {renderStars(hotel.rating)}
                    </span>
                    <span className="text-muted ms-2">({hotel.rating})</span>
                  </div>

                  {/* Price Range */}
                  {hotel.minPrice > 0 && (
                    <div className="mb-3">
                      <span className="text-primary">
                        ${hotel.minPrice}
                        {hotel.maxPrice > hotel.minPrice && ` - $${hotel.maxPrice}`}
                      </span>
                      <span className="text-muted">/night</span>
                    </div>
                  )}

                  {/* Room Count */}
                  {hotel.roomCount > 0 && (
                    <div className="mb-3">
                      <small className="text-muted">
                        {hotel.roomCount} rooms available
                      </small>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <Link
                    to={`/hotel/${hotel._id}`}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <li
                      key={page}
                      className={`page-item ${pagination.page === page ? 'active' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Loading indicator for pagination */}
          {loading && hotels.length > 0 && (
            <div className="text-center mt-3">
              <div className="loading"></div>
              <p className="mt-2">Loading more hotels...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;