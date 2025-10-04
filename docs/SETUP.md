# Setup Guide - Build2Learn Registration System

Complete installation and configuration guide for the Build2Learn Registration System.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [WhatsApp Integration (Optional)](#whatsapp-integration-optional)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11 or higher**
- **Node.js 18 or higher**
- **npm or yarn**
- **Git** (for cloning the repository)

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database Configuration (Required)
TURSO_DATABASE_URL=libsql://b2lregistration-pandawhocodes.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# WhatsApp Integration (Optional - see WHATSAPP_SETUP.md)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 5. Verify Installation

```bash
# Test backend server
python -m app.main
```

Backend should start on `http://localhost:8000`

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables (Optional)

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit `.env` (defaults work for local development):

```env
VITE_API_URL=http://localhost:8000
```

### 4. Verify Installation

```bash
# Test frontend server
npm run dev
# or
yarn dev
```

Frontend should start on `http://localhost:3000`

---

## WhatsApp Integration (Optional)

The WhatsApp bulk messaging feature is optional. To enable it:

1. **Sign up for Twilio**
   - Visit: https://www.twilio.com/try-twilio
   - Get FREE trial credit ($15-20)

2. **Get Credentials**
   - Account SID
   - Auth Token
   - From: Twilio Console Dashboard

3. **Activate WhatsApp Sandbox**
   - Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   - Follow activation steps

4. **Add to .env**
   - Add credentials to `backend/.env`

5. **Complete Setup**
   - See [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md) for detailed instructions

**Without Twilio credentials**: All features work except WhatsApp messaging.

---

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Frontend Server

```bash
cd frontend
npm run dev
```

### Access the Application

- **Public Registration**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/dashboard_under
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## Troubleshooting

### Backend Issues

**Error: "Turso credentials not found"**
- Check `.env` file exists in `backend/` directory
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set

**Error: "Module not found"**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**Port 8000 already in use**
```bash
# Kill process on port 8000 (macOS/Linux)
lsof -ti:8000 | xargs kill -9

# Or use a different port
uvicorn app.main:app --port 8001 --reload
```

### Frontend Issues

**Error: "Cannot find module"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port 3000 already in use**
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Vite will automatically suggest next available port
```

**Build errors**
```bash
# Clear cache and rebuild
rm -rf dist
npm run build
```

### WhatsApp Issues

**Error: "Twilio credentials not found"**
- This is normal if you haven't set up WhatsApp integration
- All other features will work fine
- See [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md) to enable

**Messages not delivering**
- Check recipients have joined Twilio sandbox
- Verify credentials are correct in `.env`
- Check Twilio console for error logs

---

## Next Steps

After setup is complete:

1. **Create Your First Event**
   - Go to http://localhost:3000/dashboard_under
   - Click "Create Event"
   - Add custom registration fields

2. **Test Registration**
   - Go to http://localhost:3000
   - Complete the registration form

3. **Explore Features**
   - View registrations
   - Export to CSV
   - Generate QR codes
   - Send WhatsApp messages (if configured)

---

## Additional Resources

- [Features Documentation](FEATURES.md)
- [API Documentation](API.md)
- [WhatsApp Setup](WHATSAPP_SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
- [System Architecture](../SYSTEM_ARCHITECTURE.md)

---

## Getting Help

- Check [Troubleshooting](#troubleshooting) section above
- Review [SYSTEM_ARCHITECTURE.md](../SYSTEM_ARCHITECTURE.md)
- Create an issue in the repository
