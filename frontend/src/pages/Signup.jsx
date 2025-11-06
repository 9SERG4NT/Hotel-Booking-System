import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register, isAuthenticated, error, clearError, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 50) {
      newErrors.password = 'Password cannot exceed 50 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear success message when user starts typing again
    if (registrationSuccess) {
      setRegistrationSuccess(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);

      if (result.success) {
        setRegistrationSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Registration successful! Please sign in.' }
          });
        }, 2000);
      }
    } catch (err) {
      // Error is already handled by AuthContext
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="loading"></div>
        <p className="mt-3">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className="card">
          <div className="card-header text-center">
            <h2>Sign Up</h2>
            <p className="text-muted">Create your account</p>
          </div>
          <div className="card-body">
            {/* Display auth error from context */}
            {error && (
              <div className="alert alert-danger" style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            {/* Display success message */}
            {registrationSuccess && (
              <div className="alert alert-success" style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                Registration successful! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting || registrationSuccess}
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  disabled={isSubmitting || registrationSuccess}
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Create a password"
                  disabled={isSubmitting || registrationSuccess}
                />
                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                  disabled={isSubmitting || registrationSuccess}
                />
                {errors.confirmPassword && (
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={isSubmitting || registrationSuccess}
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
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Links */}
            <div className="text-center mt-4">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="btn-link" style={{ color: '#007bff' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;