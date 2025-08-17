# 📊 Stock Market Portfolio Tracker

A comprehensive, production-ready Stock Market Portfolio Tracker built with React, TypeScript, Node.js, Express, and MongoDB. Features real-time stock data, portfolio management, watchlists, and beautiful responsive UI.

![Stock Portfolio Tracker](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green) ![Node.js](https://img.shields.io/badge/Node.js-20+-green)

## ✨ Features

- 🔍 **Real-time Stock Search** with autocomplete
- 💼 **Portfolio Management** - Add, edit, delete holdings
- ⭐ **Watchlist** with persistent storage
- 📊 **Interactive Dashboard** with charts and analytics
- 🎨 **Dark/Light Theme** with system preference support
- 💱 **Multi-currency Support** (USD, EUR, INR)
- 📱 **Fully Responsive** design for all devices
- 🔐 **JWT Authentication** with secure user management
- 🍃 **MongoDB Integration** for data persistence
- 📈 **Real-time Stock Data** via Alpha Vantage API

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or cloud)
- **Git**

### 1. Clone & Install

```bash
# Extract the downloaded zip folder
cd stock-portfolio-tracker

# Install dependencies
npm install
```

### 2. Database Setup

**Option A: Local MongoDB**

```bash
# Install MongoDB locally
# macOS
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Create free account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 3. Environment Configuration

The `.env` file is already included with development settings:

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stocktracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-long
ALPHA_VANTAGE_API_KEY=demo
PORT=3000
FRONTEND_URL=http://localhost:8080
```

**Optional: Get Real Stock Data**

1. Get free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Replace `ALPHA_VANTAGE_API_KEY=demo` with your key

### 4. Run the Application

```bash
# Start development server (runs both frontend & backend)
npm run dev
```

🎉 **Open your browser to** `http://localhost:8080`

## 📁 Project Structure

```
stock-portfolio-tracker/
├── 📱 CLIENT (Frontend - React + TypeScript)
│   ├── components/              # Custom React components
│   │   ├── Navigation.tsx       # Header with dark mode
│   │   ├── StockSearchInput.tsx # Autocomplete search
│   │   ├── AddHoldingDialog.tsx # Add stocks to portfolio
│   │   ├── StatsCard.tsx        # Portfolio statistics
│   │   ├── PortfolioChart.tsx   # Charts & visualizations
│   │   ├── Watchlist.tsx        # Stock watchlist
│   │   └── ui/                  # 40+ Shadcn/ui components
│   ├── lib/                     # Utilities & API functions
│   │   ├── stockApi.ts          # Stock data API
│   │   └── portfolioApi.ts      # Portfolio management
│   ├── pages/                   # Application pages
│   │   ├── Index.tsx            # Dashboard
│   │   ├── Search.tsx           # Stock search
│   │   ├── Portfolio.tsx        # Portfolio management
│   │   └── Settings.tsx         # Settings & preferences
│   ├── App.tsx                  # Main app with routing
│   ���── global.css               # Theme & styles
├── 🔧 SERVER (Backend - Node.js + Express + MongoDB)
│   ├── config/
│   │   └── database.ts          # MongoDB configuration
│   ├── models/                  # Mongoose data models
│   │   ├── User.ts              # User authentication
│   │   ├── Portfolio.ts         # Portfolio holdings
│   │   └── Watchlist.ts         # Stock watchlist
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication
│   ├── routes/                  # API endpoints
│   │   ├── auth.ts              # Authentication routes
│   │   ├── portfolio.ts         # Portfolio API
│   │   └── watchlist.ts         # Watchlist API
│   ├── services/
│   │   └── stockService.ts      # Stock data service
│   └── index.ts                 # Express server setup
├── 📦 SHARED
│   └── api.ts                   # Shared TypeScript types
└── ⚙️ CONFIG
    ├── package.json             # Dependencies & scripts
    ├── tailwind.config.ts       # Tailwind CSS config
    ├── vite.config.ts           # Vite build config
    └── .env                     # Environment variables
```

## 🛠�� Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm test            # Run tests
npm run typecheck   # TypeScript validation
```

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Portfolio

- `GET /api/portfolio` - Get portfolio with live data
- `POST /api/portfolio/holdings` - Add holding
- `PUT /api/portfolio/holdings/:id` - Update holding
- `DELETE /api/portfolio/holdings/:id` - Delete holding

### Watchlist

- `GET /api/watchlist` - Get watchlist with live prices
- `POST /api/watchlist/stocks` - Add stock to watchlist
- `DELETE /api/watchlist/stocks/:id` - Remove stock

## 🎯 Key Components

### Frontend Features

- **StockSearchInput**: Autocomplete search with real-time quotes
- **Portfolio Management**: Full CRUD operations for holdings
- **Watchlist**: Add/remove stocks with live price updates
- **Dashboard**: Overview cards, charts, and market summary
- **Theme System**: Dark/light mode with persistence

### Backend Features

- **MongoDB Integration**: User data, portfolios, watchlists
- **JWT Authentication**: Secure user sessions
- **Stock API Service**: Real-time data via Alpha Vantage
- **RESTful API**: Clean, documented endpoints
- **Error Handling**: Comprehensive error management

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Input Validation**: express-validator for API security
- **CORS Protection**: Configured for frontend domain
- **Environment Variables**: Sensitive data protection

## 📈 Stock Data

**Development Mode**: Uses realistic mock data for immediate setup
**Production Mode**: Integrates with Alpha Vantage API for real stock data

Supported features:

- Real-time stock quotes
- Historical price data
- Company information
- Volume and market data

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Built with Radix UI components
- **Professional Theme**: Financial app color scheme
- **Smooth Animations**: Framer Motion transitions
- **Accessibility**: WCAG compliant components

## 🌐 Deployment

### Local Production Build

```bash
npm run build
npm start
```

### Cloud Deployment

- **Vercel**: Connect GitHub repo for auto-deployment
- **Netlify**: Upload build folder or connect Git
- **Heroku**: Deploy with MongoDB Atlas
- **DigitalOcean**: Docker deployment ready

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Port Already in Use

```bash
# Kill process on port 8080
npx kill-port 8080

# Or change port in .env
PORT=3001
```

### Dependencies Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Ensure all dependencies are installed
3. Verify MongoDB is running
4. Check environment variables in `.env`

---

Built with ❤️ using React, TypeScript, Node.js, and MongoDB
