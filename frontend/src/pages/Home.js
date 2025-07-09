import React from "react";
import { Link } from "react-router-dom";
import { FaHotel, FaSearch, FaShieldAlt, FaMapMarkerAlt } from "react-icons/fa";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Stay</h1>
          <p>
            Discover amazing hotels around the world with our easy-to-use
            booking platform. From luxury resorts to budget-friendly options,
            we have something for everyone.
          </p>
          <Link to="/hotels" className="cta-button">
            Browse Hotels
          </Link>
        </div>
        <div className="hero-image">
          <div className="hero-placeholder">
            <FaHotel size={100} color="#3498db" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature">
              <FaSearch size={40} color="#3498db" />
              <h3>Easy Search</h3>
              <p>
                Find hotels by location, price, rating, and amenities with our
                advanced search filters.
              </p>
            </div>
            <div className="feature">
              <FaShieldAlt size={40} color="#3498db" />
              <h3>Secure Booking</h3>
              <p>
                Your personal information and payment details are protected with
                industry-standard security.
              </p>
            </div>
            <div className="feature">
              <FaMapMarkerAlt size={40} color="#3498db" />
              <h3>Global Coverage</h3>
              <p>
                Access to hotels worldwide with detailed information and guest
                reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="popular-destinations">
        <div className="container">
          <h2>Popular Destinations</h2>
          <div className="destinations-grid">
            <div className="destination">
              <h3>New York</h3>
              <p>150+ Hotels</p>
            </div>
            <div className="destination">
              <h3>London</h3>
              <p>200+ Hotels</p>
            </div>
            <div className="destination">
              <h3>Paris</h3>
              <p>180+ Hotels</p>
            </div>
            <div className="destination">
              <h3>Tokyo</h3>
              <p>120+ Hotels</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Book Your Next Adventure?</h2>
          <p>Join thousands of satisfied customers who trust us with their travel plans.</p>
          <Link to="/register" className="cta-button">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
