# Setup Guide - MagPie Event Registration Platform

Complete installation and configuration guide for the MagPie Event Registration Platform.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Authentication Setup (Clerk)](#authentication-setup-clerk)
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
# Database Configuration (Required for production)
TURSO_DATABASE_URL=libsql://b2lregistration-pandawhocodes.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# Local SQLite Development (set to true for local development without Turso)
LOCAL_SQLITE=false

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Authentication (Required - see Authentication Setup section)
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# WhatsApp Integration (Optional - see WHATSAPP_SETUP.md)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

#### Local SQLite Development 

For local development without requiring Turso database setup:

1. **Set `LOCAL_SQLITE=true`** in your `.env` file
2. **Leave Turso credentials empty** 
3. **The application will automatically use a local SQLite database**

```env
# For local development (no Turso required)
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
LOCAL_SQLITE=true
```

**Benefits:**
- ✅ No external database setup required
- ✅ Full functionality for testing and development
- ✅ Automatic schema creation
- ✅ Data persists locally in `local-dev/magpie_local.db`
- ✅ Easy to switch between local and production databases

**Note:** Production deployments should use `LOCAL_SQLITE=false` with proper Turso credentials.

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

Edit `.env` and add your configuration:

```env
# Backend API URL
VITE_API_URL=http://localhost:8000

# Clerk Authentication (Required - see Authentication Setup section)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
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

## Authentication Setup (Clerk)

The dashboard is protected with Clerk authentication. You'll need a Clerk account to access admin features.

### 1. Create Clerk Account

1. **Sign up at Clerk**
   - Visit: https://clerk.com
   - Click "Get Started for Free"
   - Sign up with GitHub, Google, or email

2. **Create a New Application**
   - Click "Create Application"
   - Name it (e.g., "MagPie Events")
   - Select authentication methods (Email, Google, etc.)
   - Click "Create Application"

### 2. Get API Keys

1. **Copy your API keys** from the Clerk dashboard:
   - **Publishable Key**: `pk_test_...` (starts with `pk_`)
   - **Secret Key**: `sk_test_...` (starts with `sk_`)

2. **Add to Backend `.env`**:
   ```env
   CLERK_SECRET_KEY=sk_test_your_actual_key_here
   ```

3. **Add to Frontend `.env`**:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```

### 3. Configure Clerk Application

1. **Set Redirect URLs** (in Clerk Dashboard):
   - Development: `http://localhost:3000`
   - Add `/sign-in`, `/sign-up`, `/dashboard` paths if needed

2. **Add Test Users** (Optional):
   - Go to "Users" in Clerk dashboard
   - Click "Create User"
   - Add email and password for testing

### 4. Verify Authentication

1. **Restart both servers** after adding keys
2. **Visit**: http://localhost:3000/dashboard
3. **You should be redirected to sign-in page**
4. **Sign up or sign in** with your test user

### Key Features

- ✅ **Free Tier**: 10,000 monthly active users
- ✅ **Pre-built UI**: Beautiful sign-in/sign-up forms
- ✅ **User Management**: Add/remove users via dashboard (no code)
- ✅ **Protected Dashboard**: Only authenticated users can access
- ✅ **Public Registration**: Event registration forms remain public

### What's Protected

**Dashboard Features (Require Authentication)**:
- Create/edit/delete events
- View all registrations
- Generate QR codes
- Send WhatsApp messages
- Export CSV data
- Configure branding/themes

**Public Features (No Authentication)**:
- Event registration form
- Thank you page
- QR code check-in
- Auto-fill functionality

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
- **Admin Dashboard**: http://localhost:3000/dashboard (requires Clerk sign-in)
- **Sign In/Up**: http://localhost:3000/sign-in
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

---

## Troubleshooting

### Backend Issues

**Error: "Turso credentials not found"**
- Check `.env` file exists in `backend/` directory
- For production: Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
- For local development if needed: Set `LOCAL_SQLITE=true` and leave Turso credentials empty if you want to run it via local sqlite

**Error: "CLERK_SECRET_KEY not found"**
- Check `.env` file has `CLERK_SECRET_KEY=sk_test_...`
- Get your secret key from https://dashboard.clerk.com
- Restart backend server after adding the key

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

### Authentication Issues

**Error: "Clerk publishable key not found"**
- Check `frontend/.env` has `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`
- Get your publishable key from https://dashboard.clerk.com
- Restart frontend server after adding the key

**Redirected to sign-in but can't access**
- Create a user in Clerk dashboard
- Or sign up with email on the sign-in page
- Make sure Clerk application is properly configured

**Dashboard returns 403 Forbidden**
- Check both frontend and backend have correct Clerk keys
- Verify you're signed in (check for user button in top-right)
- Try signing out and signing in again

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

1. **Sign In to Dashboard**
   - Go to http://localhost:3000/dashboard
   - Sign in with your Clerk account
   - Or create a new account on the sign-in page

2. **Create Your First Event**
   - Click "Create Event" in the dashboard
   - Add event details
   - Add custom registration fields
   - Save and activate the event

3. **Test Registration**
   - Go to http://localhost:3000 (public page)
   - Complete the registration form
   - You'll see the thank you page after successful registration

4. **Explore Dashboard Features**
   - View registrations
   - Export to CSV
   - Generate QR codes
   - Send WhatsApp messages (if configured)
   - Manage message templates
   - Configure branding and themes

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
