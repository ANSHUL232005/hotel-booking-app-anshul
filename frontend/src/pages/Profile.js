import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user } = useAuth();
  
  return (
    <div className="container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>
      
      <div className="card">
        <h3>Welcome, {user?.firstName} {user?.lastName}!</h3>
        <p>Email: {user?.email}</p>
        <p>Phone: {user?.phone}</p>
        <p>This will contain profile editing functionality.</p>
      </div>
    </div>
  );
};

export default Profile;
