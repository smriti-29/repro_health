# 🌸 Reproductive Health App

A comprehensive, inclusive reproductive health application built with the MERN stack (MongoDB, Express.js, React, Node.js) that serves all genders and anatomies with AI-powered health insights.

## 🚀 Features

### ✅ Completed (Day 1)
- **Authentication System**
  - Secure JWT-based login/register
  - Password hashing with bcrypt
  - Input validation and sanitization
  - Role-based access control

- **Inclusive User Registration**
  - Gender identity selection (Male, Female, Trans man, Trans woman, Non-binary, Intersex, Other)
  - Pronouns selection (she/her, he/him, they/them, other)
  - Sex assigned at birth options
  - Comprehensive form validation

- **Database Architecture**
  - Comprehensive User model with all onboarding fields
  - Medical history, lifestyle, and health tracking
  - Secure data storage with encryption
  - Extensible schema for future features

- **API Structure**
  - RESTful API endpoints
  - Authentication routes
  - Onboarding data management
  - Error handling and validation

### 🚧 In Development
- **11-Step Onboarding Flow**
  - Progressive questionnaire with branching logic
  - Anatomy-specific questions
  - Medical history collection
  - Privacy preferences

- **Universal Health Tracking**
  - Symptom logging
  - Medication management
  - Appointment reminders
  - Medical records upload

- **AI Integration**
  - Predictive health analysis
  - Pattern recognition
  - Personalized recommendations
  - Monthly health reports

- **Gender-Specific Features**
  - AFAB: Menstrual tracking, fertility, pregnancy support
  - AMAB: Fertility tracking, testicular health
  - Trans: Hormone therapy, surgery recovery
  - Intersex: Customizable tracking

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **React 19** with functional components
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API communication
- **CSS3** with responsive design

### Development Tools
- **ES6+** JavaScript
- **ESLint** for code quality
- **Git** for version control

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd repro_health
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Create Environment File
Create a `.env` file in the `server` directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/repro_health
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Frontend Setup
```bash
cd ../client
npm install
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 6. Run the Application

#### Development Mode
```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
cd client
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
repro_health/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API configuration
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context
│   │   ├── pages/         # Page components
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── datasets/          # Health datasets
│   └── server.js
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Onboarding
- `GET /api/onboarding/progress` - Get onboarding progress
- `POST /api/onboarding/step/:stepNumber` - Save onboarding step
- `GET /api/onboarding/step/:stepNumber` - Get step data
- `POST /api/onboarding/complete` - Complete onboarding
- `GET /api/onboarding/summary` - Get onboarding summary

## 🎯 Next Steps (10-12 Day Sprint)

### Day 2-3: Complete Onboarding Flow
- [ ] Implement 11-step onboarding wizard
- [ ] Add branching logic for anatomy-specific questions
- [ ] Create progress tracking and data persistence
- [ ] Add form validation and error handling

### Day 4-5: Universal Health Features
- [ ] Health logging system
- [ ] Medication management
- [ ] Reminder system
- [ ] Medical records upload

### Day 6-7: AI Integration
- [ ] Integrate existing datasets
- [ ] Implement predictive analysis
- [ ] Create health insights engine
- [ ] Build monthly reports

### Day 8-9: Gender-Specific Modules
- [ ] AFAB features (menstrual tracking, fertility)
- [ ] AMAB features (fertility, testicular health)
- [ ] Trans health support
- [ ] Intersex support

### Day 10-11: Advanced Features
- [ ] Mental health integration
- [ ] Lifestyle tracking
- [ ] Education hub
- [ ] UI/UX polish

### Day 12: Testing & Deployment
- [ ] Bug fixes and optimization
- [ ] Security audit
- [ ] Performance optimization
- [ ] Deployment preparation

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive form validation
- **Data Sanitization**: Protection against injection attacks
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Secure configuration management

## 🌈 Inclusivity Features

- **Gender Identity**: Comprehensive gender options
- **Pronouns**: Respectful pronoun selection
- **Anatomy Options**: Multiple reproductive anatomy selections
- **Medical History**: Inclusive medical background collection
- **Accessibility**: WCAG compliant design
- **Language Support**: Multi-language ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@reprohealth.com or create an issue in the repository.

## 🙏 Acknowledgments

- Medical professionals for guidance on reproductive health
- LGBTQ+ community for inclusivity feedback
- Open source community for amazing tools and libraries

---

**Note**: This application is for educational and personal use. Always consult with healthcare professionals for medical advice.
