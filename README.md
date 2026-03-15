diff --git a/c:\Coding\HealEsy1\README.md b/c:\Coding\HealEsy1\README.md
new file mode 100644
--- /dev/null
+++ b/c:\Coding\HealEsy1\README.md
@@ -0,0 +1,160 @@
+# AI Sales Visit Logger
+
+A React Native (Expo) mobile app for field sales reps to log customer visits, generate AI-powered summaries, and sync data with the cloud with an offline-first workflow.
+
+## Repository
+
+- GitHub: https://github.com/KunalBishwal/AI-Logger
+- Demo video: https://www.loom.com/share/0cdf8b7ac62047b0b0f0c69195513c89
+
+## Features
+
+- Email/password authentication with Firebase Auth
+- Create, edit, and review customer visit logs
+- AI-generated visit summaries using Google Gemini
+- Offline-first local storage with AsyncStorage
+- Sync visit data to Firebase Firestore
+- Light and dark theme support
+- Animated UI built with Expo and React Navigation
+
+## Tech Stack
+
+- React Native
+- Expo
+- TypeScript
+- Firebase Auth
+- Cloud Firestore
+- AsyncStorage
+- Google Gemini API
+- React Navigation
+
+## Prerequisites
+
+- Node.js 18 or newer
+- npm
+- Expo Go on a physical Android/iPhone device, or an Android/iOS simulator
+
+## Setup
+
+### 1. Clone the repository
+
+```bash
+git clone https://github.com/KunalBishwal/AI-Logger.git
+cd AI-Logger
+```
+
+If you clone into a custom folder name, use that folder name instead of `AI-Logger`.
+
+### 2. Install dependencies
+
+```bash
+npm install
+```
+
+### 3. Create the environment file
+
+Create a `.env` file in the project root:
+
+```env
+EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
+EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
+EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
+EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
+EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
+EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
+EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
+EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
+```
+
+## Firebase Setup
+
+1. Create a Firebase project.
+2. Enable Email/Password authentication.
+3. Create a Firestore database.
+4. Copy the Firebase config values into `.env`.
+
+## Running the App
+
+Start the Expo development server:
+
+```bash
+npx expo start
+```
+
+You can also use the npm scripts:
+
+```bash
+npm run start
+npm run android
+npm run ios
+```
+
+### Test on a phone
+
+- Android: scan the QR code with Expo Go
+- iPhone: scan the QR code with the Camera app or open it in Expo Go
+
+### Test on an Android emulator
+
+- Press `a` in the Expo terminal after the emulator is running
+- If `expo` is not recognized on your machine, use `npx expo start`
+
+## Gemini API Notes
+
+- The AI summary feature requires a valid Gemini API key.
+- Free-tier Gemini keys may hit rate limits.
+- If rate limiting happens, the app retries automatically before showing an error.
+
+## Troubleshooting
+
+### Expo command not found
+
+Use:
+
+```bash
+npx expo start
+```
+
+instead of:
+
+```bash
+expo start
+```
+
+### Android emulator opens a black screen
+
+The app works reliably on a physical device with Expo Go. On some newer Android emulator images, Expo Go can open the project and then show a black screen or close the experience without a JavaScript crash.
+
+Recommended workaround:
+
+- Prefer a physical device with Expo Go for review/demo
+- Or use an Android 14 / API 34 emulator image
+- If needed, use a development build instead of Expo Go on newer emulator images
+
+## Project Structure
+
+```text
+App.tsx
+index.ts
+src/
+  components/
+  config/
+  contexts/
+  screens/
+  services/
+  theme/
+  types/
+  utils/
+```
+
+## Architecture
+
+Detailed architecture notes are available here:
+
+- [ARCHITECTURE.md](./ARCHITECTURE.md)
+
+## Notes
+
+- Visit data is stored locally first and synced later.
+- Firebase auth persistence is enabled for session reuse.
+- AI summaries are generated on demand and stored with the visit record.
