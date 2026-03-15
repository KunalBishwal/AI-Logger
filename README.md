# AI Sales Visit Logger

A React Native (Expo) mobile app for field sales reps to log customer visits, generate AI-powered summaries, and sync data with the cloud — all with offline-first support.

## ✨ Features

- **Authentication** — Email/password login with persistent sessions (Firebase Auth)
- **Visit Logging** — Create, edit, and view detailed customer visit logs
- **AI Summaries** — Generate structured summaries from raw meeting notes using Google Gemini
- **Offline-First** — Full CRUD operations work without internet (AsyncStorage)
- **Cloud Sync** — Automatic sync to Firebase Firestore with retry on failure
- **Dark/Light Mode** — Beautiful theme system with purple gradient accents
- **Animated UI** — Smooth entrance animations, press effects, and transitions

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your phone (for testing) **or** Android/iOS emulator

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd HealEsy1

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore** database
4. Copy your config values to `.env`

### Running

```bash
# Start Expo dev server
npx expo start

# Scan the QR code with Expo Go (Android) or Camera app (iOS)
# OR press 'a' for Android emulator / 'i' for iOS simulator
```

## 🤖 Gemini AI API Keys

To use the AI summary feature, you need a Google Gemini API Key:

1. **Get a Key**: Visit [Google AI Studio](https://aistudio.google.com/) and create a free API key.
2. **Setup**: Add the key to your `.env` file as `EXPO_PUBLIC_GEMINI_API_KEY`.
3. **Rate Limits**: 
   - The free tier has limits (approx 15 requests per minute).
   - If you hit a rate limit, the app will show a **"Rate limit hit"** warning in the console and automatically retry (up to 5 times) with exponential backoff before showing an error toast in the app.

## 📁 Project Structure

```
├── App.tsx                     # Entry point with navigation
├── src/
│   ├── config/firebase.ts      # Firebase initialization
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Dark/light theme
│   ├── services/
│   │   ├── storageService.ts   # AsyncStorage wrapper
│   │   ├── syncService.ts      # Firestore sync engine
│   │   └── aiService.ts        # Gemini AI integration
│   ├── screens/
│   │   ├── LoginScreen.tsx     # Authentication
│   │   ├── HomeScreen.tsx      # Dashboard & app info
│   │   ├── VisitListScreen.tsx # Visit log list
│   │   ├── VisitFormScreen.tsx # Create/edit visits
│   │   └── VisitDetailScreen.tsx # Full visit details
│   ├── components/             # Reusable UI components
│   ├── theme/colors.ts         # Color palettes
│   ├── types/index.ts          # TypeScript interfaces
│   └── utils/validation.ts     # Form validation
```

## 🏗️ Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture notes.

## 📱 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React Native + Expo | Mobile framework |
| TypeScript | Type safety |
| Firebase Auth | Authentication |
| Cloud Firestore | Remote database |
| AsyncStorage | Local persistence |
| Google Gemini AI | AI summaries |
| React Navigation | Screen navigation |
| Expo Linear Gradient | Gradient UI effects |
