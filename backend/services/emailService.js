const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const emailService = {
  // Send booking confirmation email
  sendBookingConfirmation: async (userEmail, bookingDetails) => {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Booking Confirmation - Hotel Booking App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3498db;">Booking Confirmation</h2>
          <p>Dear ${bookingDetails.guestDetails.firstName},</p>
          <p>Thank you for your booking! Here are your reservation details:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Booking Details</h3>
            <p><strong>Hotel:</strong> ${bookingDetails.hotel.name}</p>
            <p><strong>Room Type:</strong> ${bookingDetails.roomType}</p>
            <p><strong>Check-in:</strong> ${new Date(bookingDetails.checkInDate).toLocaleDateString()}</p>
            <p><strong>Check-out:</strong> ${new Date(bookingDetails.checkOutDate).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${bookingDetails.guests.adults} Adults, ${bookingDetails.guests.children} Children</p>
            <p><strong>Total Amount:</strong> $${bookingDetails.totalAmount}</p>
            <p><strong>Booking ID:</strong> ${bookingDetails._id}</p>
          </div>
          
          <p>If you have any questions, please contact us at ${process.env.EMAIL_FROM}</p>
          <p>Best regards,<br>Hotel Booking Team</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      throw error;
    }
  },

  // Send booking cancellation email
  sendBookingCancellation: async (userEmail, bookingDetails) => {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Booking Cancellation - Hotel Booking App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Booking Cancellation</h2>
          <p>Dear ${bookingDetails.guestDetails.firstName},</p>
          <p>Your booking has been cancelled as requested.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Cancelled Booking Details</h3>
            <p><strong>Hotel:</strong> ${bookingDetails.hotel.name}</p>
            <p><strong>Booking ID:</strong> ${bookingDetails._id}</p>
            <p><strong>Cancellation Date:</strong> ${new Date(bookingDetails.cancellationDate).toLocaleDateString()}</p>
            <p><strong>Reason:</strong> ${bookingDetails.cancellationReason}</p>
          </div>
          
          <p>If you have any questions, please contact us at ${process.env.EMAIL_FROM}</p>
          <p>Best regards,<br>Hotel Booking Team</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Booking cancellation email sent successfully');
    } catch (error) {
      console.error('Error sending booking cancellation email:', error);
      throw error;
    }
  },

  // Send welcome email
  sendWelcomeEmail: async (userEmail, userName) => {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Welcome to Hotel Booking App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3498db;">Welcome to Hotel Booking App!</h2>
          <p>Dear ${userName},</p>
          <p>Welcome to our hotel booking platform! We're excited to have you join us.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>What you can do:</h3>
            <ul>
              <li>Browse thousands of hotels worldwide</li>
              <li>Book rooms with instant confirmation</li>
              <li>Manage your bookings online</li>
              <li>Leave reviews and ratings</li>
            </ul>
          </div>
          
          <p>Start exploring amazing hotels today!</p>
          <p>Best regards,<br>Hotel Booking Team</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  },

  // Send password reset email
  sendPasswordReset: async (userEmail, resetToken) => {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: 'Password Reset - Hotel Booking App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3498db;">Password Reset Request</h2>
          <p>You requested a password reset for your Hotel Booking App account.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          
          <p><strong>Note:</strong> This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>Hotel Booking Team</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
};

module.exports = emailService;
