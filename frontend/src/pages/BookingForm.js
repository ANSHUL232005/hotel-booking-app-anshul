import React from "react";
import { useParams } from "react-router-dom";

const BookingForm = () => {
  const { hotelId } = useParams();
  
  return (
    <div className="container">
      <div className="page-header">
        <h1>Book Your Stay</h1>
        <p>Complete your reservation</p>
      </div>
      
      <div className="card">
        <p>Booking form for hotel ID: {hotelId}</p>
        <p>This will contain the booking form with date selection, guest details, and payment.</p>
      </div>
    </div>
  );
};

export default BookingForm;
