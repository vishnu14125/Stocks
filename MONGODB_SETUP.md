# 🍃 MongoDB Setup Guide

## ⚠️ MongoDB is Now Required

Your Stock Market Portfolio Tracker now requires MongoDB to function. All data (portfolio, watchlist, user accounts) is stored securely in MongoDB.

## 🚀 Quick Setup

### Option 1: Local MongoDB (Recommended for Development)

**macOS:**
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
brew services list | grep mongodb
```

**Ubuntu/Debian:**
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

**Windows:**
1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Start MongoDB as a Windows service

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account**: Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create Cluster**: Choose the free tier
3. **Setup Database User**: Create username/password
4. **Whitelist IP**: Add your IP address (or 0.0.0.0/0 for development)
5. **Get Connection String**: Copy the connection string
6. **Update .env**: Replace `MONGODB_URI` with your Atlas connection string

Example Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.abcde.mongodb.net/stocktracker?retryWrites=true&w=majority
```

## 🔧 Verify Setup

### Test MongoDB Connection
```bash
# Start your app
npm run dev

# Check health endpoint
curl http://localhost:8080/api/health

# Should return: {"status":"healthy","database":"connected"}
```

### If MongoDB is Not Running:
The app will exit with this error:
```
🚨 MongoDB connection failed: MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
💡 To start MongoDB:
   1. Install MongoDB: https://docs.mongodb.com/manual/installation/
   2. Start MongoDB: mongod
   3. Or use MongoDB Atlas: https://cloud.mongodb.com

🛑 Application requires MongoDB to function
```

## 🎯 What You Get with MongoDB

### ✅ User Authentication
- Secure registration and login
- JWT token-based authentication
- Password hashing with bcrypt

### ✅ Cloud Data Storage
- Portfolio data synced across devices
- Watchlist backed up safely
- User preferences saved

### ✅ Real-time Updates
- Live portfolio calculations
- Stock price tracking
- Performance analytics

## 🔒 Security Features

- **Encrypted Passwords**: bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **Input Validation**: Server-side validation for all data
- **CORS Protection**: Configured for your domain

## 🆘 Troubleshooting

### MongoDB Won't Start
```bash
# macOS - Check if MongoDB is running
brew services list | grep mongodb

# If not running, start it
brew services start mongodb-community

# Linux - Check MongoDB status
sudo systemctl status mongod

# If not running, start it
sudo systemctl start mongod
```

### Connection Issues
- **Port 27017**: Make sure nothing else is using MongoDB's default port
- **Firewall**: Ensure MongoDB port is not blocked
- **Permissions**: Check MongoDB has write permissions to data directory

### Atlas Connection Issues
- **IP Whitelist**: Make sure your IP is whitelisted
- **Credentials**: Verify username/password are correct
- **Connection String**: Ensure the connection string format is correct

## 📞 Need Help?

- **MongoDB Documentation**: [docs.mongodb.com](https://docs.mongodb.com)
- **Installation Guides**: [docs.mongodb.com/manual/installation/](https://docs.mongodb.com/manual/installation/)
- **Atlas Getting Started**: [docs.atlas.mongodb.com/getting-started/](https://docs.atlas.mongodb.com/getting-started/)

Your Stock Market Portfolio Tracker is now powered by MongoDB for secure, reliable data storage! 🎉
