# 🏨 Hotel Booking App

A full-stack hotel booking application with modern features including payment processing, image management, and comprehensive admin dashboard.

## 🚀 Live Demo

- **Frontend**: [https://hotel-booking-frontend.netlify.app](https://hotel-booking-frontend.netlify.app)
- **Backend API**: [https://hotel-booking-api.herokuapp.com](https://hotel-booking-api.herokuapp.com)
- **Admin Dashboard**: [https://hotel-booking-frontend.netlify.app/admin](https://hotel-booking-frontend.netlify.app/admin)

## ✨ Features

### Core Features
- 🔐 User authentication and authorization
- 🏨 Hotel browsing and search
- 📅 Room booking system
- 👤 User profile management
- 📱 Responsive design

### Advanced Features
- 💳 **Payment Integration** - Stripe payment processing
- 📸 **Image Uploads** - Cloudinary integration for hotel images
- 🔍 **Advanced Search Filters** - City, price, rating, amenities, dates
- 📧 **Email Notifications** - Booking confirmations, cancellations, welcome emails
- 📊 **Admin Dashboard** - Complete admin panel with analytics
- ⭐ **Reviews and Ratings** - User reviews with rating system

## Project Structure

```
hotel-booking-app/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
└── README.md         # Project documentation
```

## 🛠️ Technology Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Processing
- Cloudinary Image Storage
- Nodemailer Email Service

### Frontend
- React 18
- React Router
- Stripe React Components
- Recharts for Analytics
- React Image Gallery
- React Star Ratings

## 📦 Environment Setup

### 1. Backend Environment Variables
Create `.env` file in `/backend` directory:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/hotel-booking

# Security
JWT_SECRET=your-super-secret-jwt-key-here

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Image Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# App Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Environment Variables
Create `.env` file in `/frontend` directory:

```bash
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_API_URL=http://localhost:5000
```

## 🚀 Local Development

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🌐 Production Deployment

### 1. Deploy to Heroku (Backend)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create hotel-booking-api

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set STRIPE_SECRET_KEY=your-stripe-secret
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
heroku config:set CLOUDINARY_API_KEY=your-api-key
heroku config:set CLOUDINARY_API_SECRET=your-api-secret
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set EMAIL_FROM=your-email@gmail.com

# Deploy
git subtree push --prefix backend heroku main
```

### 2. Deploy to Netlify (Frontend)

```bash
# Build the app
cd frontend
npm run build

# Deploy to Netlify
# Upload the build folder to Netlify
# Set environment variables in Netlify dashboard
```

### 3. Deploy to Vercel (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd frontend
vercel --prod
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

## 📊 Admin Dashboard Features

- User management
- Booking management
- Hotel management
- Review moderation
- Revenue analytics
- Performance metrics

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Hotels
- `GET /api/hotels` - Get hotels with filters
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/hotels` - Create hotel (Admin)
- `PUT /api/hotels/:id` - Update hotel (Admin)
- `DELETE /api/hotels/:id` - Delete hotel (Admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/confirm-payment` - Confirm payment
- `GET /api/payments/payment-status/:id` - Get payment status
- `POST /api/payments/refund` - Process refund

### Reviews
- `GET /api/reviews/hotel/:id` - Get hotel reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/bookings` - Manage bookings
- `GET /api/admin/reviews` - Manage reviews
- `GET /api/admin/analytics/revenue` - Revenue analytics

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🛡️ Error Handling

- Comprehensive error handling
- User-friendly error messages
- Logging for debugging
- Graceful fallbacks

## 📞 Support

For support or questions about deployment:
- Check the logs for error messages
- Verify all environment variables are set
- Ensure database connection is working
- Test API endpoints individually

## 🎉 Features to Add (Future Enhancements)

- Real-time notifications
- Multi-language support
- Advanced search with maps
- Loyalty program
- Social login integration
- Push notifications
- Booking reminders
- Analytics dashboard
- A/B testing
- Performance monitoring

---

### Setup Instructions

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with your environment variables
4. Start the server: `npm start`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

## API Endpoints

- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/bookings` - Create a booking
- `GET /api/bookings` - Get user bookings
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Technologies Used

- **Frontend**: React, React Router, Axios, CSS3
- **Backend**: Node.js, Express, MongoDB, JWT
- **Database**: MongoDB with Mongoose ODM
