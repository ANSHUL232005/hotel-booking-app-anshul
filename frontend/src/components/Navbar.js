import React from "react";
import { Link } from "react-router-dom";
import { FaHotel, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <FaHotel />
          <span>Hotel Booking</span>
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/hotels" className="nav-link">
            Hotels
          </Link>

          {isAuthenticated ? (
            <div className="nav-user">
              <Link to="/my-bookings" className="nav-link">
                My Bookings
              </Link>
              <div className="user-dropdown">
                <button className="user-button">
                  <FaUser />
                  <span>{user?.firstName}</span>
                </button>
                <div className="dropdown-content">
                  <Link to="/profile" className="dropdown-link">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-link">
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link nav-register">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
