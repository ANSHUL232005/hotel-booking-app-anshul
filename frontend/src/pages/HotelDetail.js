import React from "react";
import { useParams } from "react-router-dom";

const HotelDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="container">
      <div className="page-header">
        <h1>Hotel Details</h1>
        <p>View hotel information and amenities</p>
      </div>
      
      <div className="card">
        <p>Hotel detail page for hotel ID: {id}</p>
        <p>This will display detailed information about the selected hotel.</p>
      </div>
    </div>
  );
};

export default HotelDetail;
