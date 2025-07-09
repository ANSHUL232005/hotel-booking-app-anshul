# Hotel Booking App - Deployment Guide

## 🚀 Features Implemented

### ✅ Core Features
- [x] User authentication and authorization
- [x] Hotel browsing and search
- [x] Room booking system
- [x] User profile management

### ✅ Advanced Features
- [x] **Payment Integration** - Stripe payment processing
- [x] **Image Uploads** - Cloudinary integration for hotel images
- [x] **Advanced Search Filters** - City, price, rating, amenities, dates
- [x] **Email Notifications** - Booking confirmations, cancellations, welcome emails
- [x] **Admin Dashboard** - Complete admin panel with analytics
- [x] **Reviews and Ratings** - User reviews with rating system

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

## 📁 Project Structure

```
hotel-booking-app/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── services/        # Business logic services
│   ├── package.json     # Backend dependencies
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── contexts/    # React contexts
│   │   └── utils/       # Utility functions
│   ├── public/          # Static files
│   └── package.json     # Frontend dependencies
└── README.md
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

**Your hotel booking application is now ready for production deployment!** 🚀

The application includes all requested features:
- ✅ Payment integration with Stripe
- ✅ Image uploads with Cloudinary
- ✅ Advanced search filters
- ✅ Email notifications
- ✅ Admin dashboard
- ✅ Reviews and ratings

Deploy it to your preferred platform and start accepting bookings!
