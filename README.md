# AI Sales Visit Logger

A React Native (Expo) app for field sales reps to log visits, generate AI summaries, and sync records with an offline-first workflow.

## Links

- GitHub: https://github.com/KunalBishwal/AI-Logger
- Demo video: https://www.loom.com/share/0cdf8b7ac62047b0b0f0c69195513c89

## What It Does

- Email/password authentication with Firebase Auth
- Create, edit, and review visit records
- Generate AI summaries from raw meeting notes using Google Gemini
- Save data locally with AsyncStorage for offline use
- Sync visit data to Firebase Firestore
- Support light and dark themes

## Tech Stack

- React Native
- Expo
- TypeScript
- Firebase Auth
- Cloud Firestore
- AsyncStorage
- Google Gemini API
- React Navigation

## Requirements

- Node.js 18+
- npm
- Expo Go on a physical device, or an Android/iOS simulator

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/KunalBishwal/AI-Logger.git
cd AI-Logger
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create a `.env` file in the project root:

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

### 4. Configure Firebase

1. Create a Firebase project.
2. Enable Email/Password authentication.
3. Create a Firestore database.
4. Copy the Firebase web config values into `.env`.

## Run the App

Start the development server:

```bash
npx expo start
```

Available scripts:

```bash
npm run start
npm run android
npm run ios
```

## Testing

### On a phone

- Android: scan the QR code with Expo Go
- iPhone: scan the QR code with the Camera app or open it in Expo Go

### On an emulator

- Start the emulator first
- Run `npx expo start`
- Press `a` for Android or `i` for iOS

## Notes

- The AI summary feature needs a valid Gemini API key.
- Free-tier Gemini usage may hit rate limits.
- Visit data is saved locally first, then synced to Firestore.
- Auth session persistence is enabled.

## Troubleshooting

### `expo` command not found

Use:

```bash
npx expo start
```

instead of:

```bash
expo start
```

### Android emulator shows a black screen

The app works reliably on a physical device with Expo Go. Some newer Android emulator images can open Expo Go and then show a black screen without a JavaScript crash.

Recommended workaround:

- Use a physical device with Expo Go
- Or use an Android 14 / API 34 emulator image
- Or use a development build instead of Expo Go on newer emulator images

## Project Structure

```text
App.tsx
index.ts
src/
  components/
  config/
  contexts/
  screens/
  services/
  theme/
  types/
  utils/
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for implementation notes.
