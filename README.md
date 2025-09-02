# 🏥 Medical AI Assistant

An advanced healthcare application that records patient-doctor conversations, automatically transcribes them, and uses AI to extract clinical insights including symptoms, differential diagnoses, and critical alerts.

## 🚀 Features

- **🎙️ High-quality audio recording** with native Expo Audio
- **📝 Automatic transcription** using OpenAI Whisper
- **🧠 AI-powered medical analysis** with GPT-4
- **⚡ Real-time clinical insights** extraction
- **🔒 LGPD/HIPAA compliant** security measures
- **📱 Professional medical interface** optimized for healthcare workflows
- **📊 Timeline visualization** of consultation flow
- **📋 Export functionality** for clinical reports

## 🏗️ Architecture

```
├── app/                          # Expo React Native Frontend
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx            # Recording screen
│   │   ├── results.tsx          # Analysis results
│   │   └── settings.tsx         # App configuration
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
├── services/                     # Business logic & API calls
└── server/                       # Express.js Backend
    ├── src/
    │   ├── routes/              # API endpoints
    │   ├── middleware/          # Express middleware
    │   └── utils/               # Helper functions
    └── package.json
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- OpenAI API key

### Frontend Setup (Expo)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open the app:**
   - Scan QR code with Expo Go app
   - Or press `w` to open in web browser

### Backend Setup (Express)

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your OpenAI API key:**
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   PORT=3000
   NODE_ENV=development
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### App Settings

Configure the backend URL in the Settings tab:
- **Development**: `https://ecuador-authority-meal-simplified.trycloudflare.com`
- **Production**: Your deployed server URL

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for Whisper & GPT | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | Yes |
| `ALLOWED_ORIGINS` | CORS allowed origins | No |

## 🔒 Security & Privacy

### Data Protection
- ✅ Audio files are processed securely and deleted after analysis
- ✅ No permanent storage of patient data
- ✅ End-to-end encryption ready for production
- ✅ Rate limiting and input validation
- ✅ CORS protection and security headers

### LGPD/HIPAA Compliance
- 🔐 **Data Minimization**: Only necessary data is processed
- 🗑️ **Right to Deletion**: Audio files are automatically deleted
- 🔒 **Data Security**: Industry-standard encryption
- 📋 **Audit Trail**: All operations are logged
- 🚫 **No Data Sharing**: No third-party data sharing

### Production Security Checklist
- [ ] Use HTTPS/SSL certificates
- [ ] Configure secure CORS origins
- [ ] Set up proper authentication
- [ ] Enable request logging
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts

## 📋 API Documentation

### Endpoints

#### `POST /api/transcribe`
Transcribe audio file to text.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `audio` file (MP3, M4A, WAV, MP4)

**Response:**
```json
{
  "transcription": "Texto da conversa transcrita...",
  "duration": 120000,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### `POST /api/analyze`
Analyze medical consultation transcription.

**Request:**
```json
{
  "transcription": "Texto da consulta médica..."
}
```

**Response:**
```json
{
  "symptoms": ["dor de cabeça", "febre"],
  "differentialDiagnosis": ["enxaqueca", "sinusite"],
  "redFlags": ["febre alta persistente"],
  "medications": ["paracetamol"],
  "recommendations": ["exame neurológico", "retorno em 48h"],
  "summary": "Paciente apresenta cefaleia com febre..."
}
```

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "openai": "ok"
  }
}
```

## 🚀 Deployment

### Frontend (Expo)
```bash
# Build for web
npm run build:web

# Deploy to Vercel/Netlify
# Upload the dist/ folder
```

### Backend (Express)
```bash
# Build and deploy to Railway/Render
# Set environment variables in deployment platform
```

### Recommended Deployment Stack
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or DigitalOcean
- **Domain**: Custom domain with SSL
- **Monitoring**: Sentry for error tracking

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Manual Testing Checklist
- [ ] Audio recording works on device
- [ ] Transcription returns accurate text
- [ ] Medical analysis extracts relevant data
- [ ] Error handling works properly
- [ ] Settings are saved correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Medical Disclaimer

This application is designed to assist healthcare professionals and should not replace professional medical judgment. All AI-generated analyses should be reviewed by qualified healthcare providers before making clinical decisions.

## 🆘 Support

For technical support or questions:
- Check the health endpoint: `/api/health`
- Review server logs for error details
- Ensure OpenAI API key is valid and has sufficient credits

---

**Built with ❤️ for healthcare professionals**