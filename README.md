# Roomify - Advanced Travel & Booking Platform

**Final Year Project - Mohammad Ali Jinnah University**

A comprehensive travel platform that combines hotel booking, taxi services, real-time tracking, social collaboration, and advanced payment processing.

## Team Members
- **Mohammad Irtiza Panjwani** - Lead Full-Stack Developer & Project Manager
- **Aisha Kamran** - Frontend Developer & UI/UX Designer  
- **Inmbsat** - Backend Developer & Database Architect

## Project Evolution

### Original Foundation
This project was built upon the initial work of **SmartBooking** created by:
- Jiajie Yin
- Lei Li  
- Jiyoon Jeong

**Original Repository:** https://github.com/CloverJiyoon/SmartBooking

We acknowledge and appreciate their foundational work in creating the basic hotel booking system, which provided the starting point for our enhanced platform.

### Our Enhancements & Contributions
We have completely transformed the original project, adding enterprise-level features and modern architecture to create a comprehensive travel platform.

## 🚀 Key Features

### 🏨 Enhanced Hotel Booking System
- Advanced search and filtering capabilities
- Real-time room availability checking
- Interactive booking interface with date selection
- Comprehensive reservation management
- Multi-room booking support

### 🚗 Complete Taxi Service Platform
- **Real-time GPS Tracking**: Live driver location updates using Socket.io
- **Interactive Maps**: MapLibre/Mapbox integration with route visualization
- **Service Tiers**: Basic ($15), Standard ($25), Premium ($40) with different coverage areas
- **ETA Calculations**: Real-time distance and arrival time estimates using Turf.js
- **Route Optimization**: OSRM routing service integration

### 👥 Social Collaboration Features
- **User Connections**: Send and manage friend requests
- **Shared Reservations**: Split hotel bookings among multiple users
- **Group Payment Coordination**: Track individual payment status
- **Real-time Messaging**: Chat system with predefined and custom messages
- **Payment Reminders**: Social features to coordinate group payments

### 💳 Advanced Payment System
- **Stripe Integration**: Secure payment processing for both hotels and taxi services
- **Split Payments**: Handle shared reservation payments with individual tracking
- **Refund Management**: Time-based refund policies for taxi cancellations
- **Payment Status Tracking**: Real-time updates across multiple users
- **Multiple Payment Types**: Support for different service payments

### 🔄 Real-time Features
- **WebSocket Integration**: Live updates for location, messages, and payments
- **Live Location Tracking**: Real-time driver position updates
- **Instant Messaging**: Real-time chat between connected users
- **Payment Notifications**: Live payment status updates

### 🎨 Modern User Interface
- **Material-UI Components**: Professional, responsive design
- **Vite Build System**: Fast development and optimized builds
- **Mobile Responsive**: Optimized for all device sizes
- **Interactive Maps**: Smooth map interactions with real-time updates
- **Loading States**: Proper loading indicators and error handling

## 🛠️ Technical Architecture

### Frontend Technologies
- **React 18** with modern hooks and context API
- **Vite** for fast development and building
- **Material-UI (MUI)** for component library
- **React Router v6** for navigation
- **Socket.io Client** for real-time features
- **Stripe React** for payment processing
- **MapLibre GL** for interactive maps
- **Axios** for API communication

### Backend Technologies
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time WebSocket connections
- **JWT Authentication** with secure cookie handling
- **Stripe API** for payment processing
- **Nodemailer** for email notifications
- **CORS** and security middleware

### Key Integrations
- **Stripe Payment Gateway**: Secure payment processing
- **MapLibre/Mapbox**: Interactive mapping and geolocation
- **OSRM Routing**: Route calculation and optimization
- **Socket.io**: Real-time bidirectional communication
- **Nodemailer**: Automated email confirmations

## 📱 User Experience Features

### Authentication & Security
- Secure JWT-based authentication
- Protected routes and middleware
- User session management
- Password encryption with bcrypt

### Booking Management
- Comprehensive reservation dashboard
- Booking history and status tracking
- Cancellation and modification options
- Email confirmations for all bookings

### Social Features
- User search and connection requests
- Friend management system
- Group booking coordination
- Real-time chat functionality

### Payment Experience
- Seamless Stripe checkout integration
- Split payment coordination
- Payment status tracking
- Automated refund processing

## 🗂️ Database Schema

### Core Models
- **User**: Authentication, profile, and connection management
- **Hotel**: Property information and amenities
- **Room**: Room types, availability, and pricing
- **Reservation**: Booking details and status tracking
- **SharedReservation**: Group booking coordination
- **TaxiReservation**: Taxi service bookings
- **UserConnection**: Friend/connection relationships
- **Message**: Real-time messaging system

### Advanced Features
- Complex relationships between users and reservations
- Real-time availability tracking
- Payment status coordination across multiple users
- Social connection management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Stripe Account (for payments)
- MapLibre/Mapbox API key

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repository-url]
   cd roomify
   ```

2. **Install Backend Dependencies**
   ```bash
   cd api
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the `api` directory:
   ```env
   MONGO=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

   Create `.env.local` file in the `client` directory:
   ```env
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

5. **Start the Application**
   
   Backend (Port 7000):
   ```bash
   cd api
   npm run dev
   ```

   Frontend (Port 3000):
   ```bash
   cd client
   npm run dev
   ```

## 📋 Available Scripts

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate:roomNumbers` - Run database migrations

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌟 Key Improvements Over Original

### Technical Enhancements
- **Modern Build System**: Migrated from Create React App to Vite for faster development
- **Advanced State Management**: Implemented proper React Context patterns
- **Real-time Architecture**: Added WebSocket support for live features
- **Payment Integration**: Complete Stripe payment system
- **Map Integration**: Interactive maps with real-time tracking

### Feature Additions
- **Taxi Service**: Complete ride-hailing platform
- **Social Features**: User connections and messaging
- **Group Bookings**: Shared reservation system
- **Real-time Tracking**: Live location updates
- **Advanced UI**: Material-UI components with responsive design

### Code Quality
- **TypeScript-ready**: Modern JavaScript with proper error handling
- **Modular Architecture**: Well-organized component structure
- **Security**: Proper authentication and authorization
- **Performance**: Optimized builds and lazy loading

## 🎯 Project Objectives Achieved

### Academic Requirements
- ✅ Complex full-stack application
- ✅ Real-time features implementation
- ✅ Third-party API integrations
- ✅ Advanced database relationships
- ✅ Modern development practices

### Technical Objectives
- ✅ Scalable architecture design
- ✅ Real-time communication
- ✅ Payment processing integration
- ✅ Geolocation and mapping
- ✅ Social features implementation

## 🔮 Future Enhancements

### Planned Features
- Mobile application (React Native)
- Advanced analytics dashboard
- AI-powered recommendations
- Multi-language support
- Advanced notification system

### Technical Improvements
- Microservices architecture
- Redis caching implementation
- Advanced testing coverage
- CI/CD pipeline setup
- Docker containerization

## 📊 Project Statistics

- **Total Components**: 50+ React components
- **API Endpoints**: 40+ RESTful endpoints
- **Database Models**: 8 complex schemas
- **Real-time Features**: 5 Socket.io implementations
- **Third-party Integrations**: 6 external services
- **Development Time**: 6 months
- **Lines of Code**: 15,000+ lines

## 🤝 Contributing

This is an academic project for Mohammad Ali Jinnah University. For any questions or suggestions, please contact the team members.

## 📄 License

This project is developed for academic purposes at Mohammad Ali Jinnah University.

## 🙏 Acknowledgments

- **Original SmartBooking Team**: For providing the foundational codebase
- **Mohammad Ali Jinnah University**: For project guidance and support
- **Open Source Community**: For the amazing tools and libraries used
- **Stripe, MapLibre, and other service providers**: For their excellent APIs

---

**Developed with ❤️ by the Roomify Team**  
*Mohammad Ali Jinnah University - Final Year Project 2025*