# Build2Learn Registration System

A professional, production-ready event registration system with dynamic forms, QR code check-ins, and WhatsApp notifications.

[![Demo](https://img.shields.io/badge/Demo-Watch%20Video-blue)](https://drive.google.com/file/d/1LoGf9au5TWb-CxOKrGy-izX913Js2pK4/view?usp=sharing)
[![Version](https://img.shields.io/badge/version-1.2.0-green.svg)](https://github.com/PandaWhoCodes/b2l_registration/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Key Features

- 🎯 **Event Management** - Create, edit, clone, and manage events
- 📝 **Dynamic Registration Forms** - Add custom fields per event
- 🔄 **Auto-fill System** - Remembers user data across events
- 📱 **WhatsApp Notifications** - Send bulk messages to registrants ✨ NEW!
- 🔗 **QR Code Check-ins** - Generate and scan QR codes for attendance
- 📊 **Analytics & Export** - View registrations and export to CSV
- 🎨 **Modern UI** - Responsive design with smooth animations
- ⚡ **Fast & Reliable** - Built with FastAPI and React

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/PandaWhoCodes/b2l_registration.git
cd b2l_registration

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure .env (see Setup Guide)
cp .env.example .env
# Edit .env with your credentials

# Start backend
uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

**Access**:
- Frontend: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard_under
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

For detailed installation instructions, see **[Setup Guide](docs/SETUP.md)**.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **[Setup Guide](docs/SETUP.md)** | Complete installation and configuration |
| **[Features Guide](docs/FEATURES.md)** | Detailed feature documentation |
| **[API Reference](docs/API.md)** | API endpoints and examples |
| **[WhatsApp Setup](docs/WHATSAPP_SETUP.md)** | WhatsApp integration guide |
| **[Deployment Guide](docs/DEPLOYMENT.md)** | Production deployment instructions |
| **[System Architecture](SYSTEM_ARCHITECTURE.md)** | Technical architecture details |

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Turso** - Serverless SQLite database
- **Twilio** - WhatsApp messaging API
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Query** - State management

---

## 📱 WhatsApp Integration

Send bulk WhatsApp messages to all event registrants with one click!

**Features**:
- 📤 Bulk messaging
- 📱 Automatic phone formatting (+91 for India)
- 📊 Delivery tracking
- 💰 Cost-effective (FREE sandbox, ~₹0.75/msg production)

**Setup**: See [WhatsApp Setup Guide](docs/WHATSAPP_SETUP.md)

---

## 🎯 Usage

### 1. Create an Event

Visit Dashboard → Create Event → Add custom fields → Save

### 2. Activate Event

Click toggle icon to activate (only one event can be active)

### 3. Share Registration Link

Share `http://localhost:3000` with participants

### 4. Manage Registrations

View registrations → Export CSV → Send WhatsApp messages

### 5. Check-in with QR Codes

Generate QR code → Print/display → Scan at event

**For detailed usage**, see [Features Guide](docs/FEATURES.md).

---

## 📊 Dashboard Features

**Access**: `/dashboard_under` (no authentication required)

- ✏️ **Create/Edit Events** - Manage event details and fields
- 🔄 **Clone Events** - Duplicate with one click
- 👥 **View Registrations** - Search, filter, check-in status
- 📱 **Send WhatsApp** - Bulk messaging to all registrants
- 📥 **Export CSV** - Download registration data
- 🔗 **Generate QR Codes** - For check-ins with custom messages
- ⚡ **Toggle Active Status** - Activate/deactivate events

---

## 🚢 Deployment

### Render (Recommended)

```bash
# Push to GitHub
git push origin master

# Deploy on Render
# 1. Connect repository
# 2. Render auto-detects render.yaml
# 3. Add environment variables
# 4. Deploy!
```

### Other Platforms

Supports deployment to:
- Vercel / Netlify (frontend)
- AWS / DigitalOcean (backend)
- Docker containers
- Traditional VPS

**For detailed deployment**, see [Deployment Guide](docs/DEPLOYMENT.md).

---

## 🔐 Security

- ✅ Input validation (Pydantic)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Environment variables for secrets

**Note**: No authentication by design. For production, add authentication middleware.

---

## 📝 Environment Variables

### Backend (.env)
```env
TURSO_DATABASE_URL=your_database_url
TURSO_AUTH_TOKEN=your_auth_token
FRONTEND_URL=http://localhost:3000

# Optional: WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📜 License

MIT License - Feel free to use and modify for your needs.

---

## 🆘 Support

- 📖 [Documentation](docs/)
- 🐛 [Report Issues](https://github.com/PandaWhoCodes/b2l_registration/issues)
- 💬 [Discussions](https://github.com/PandaWhoCodes/b2l_registration/discussions)

---

## 🙏 Acknowledgments

Built for Build2Learn by [PandaWhoCodes](https://github.com/PandaWhoCodes)

---

**Made with ❤️ for Build2Learn**
