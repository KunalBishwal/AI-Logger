# Architecture Notes

## Data Flow

```
User Action → Screen Component → Service Layer → Storage
                                                    ├── AsyncStorage (local, immediate)
                                                    └── Firestore (remote, async sync)
```

1. **Create/Edit Visit**: User fills form → validated → saved to AsyncStorage as `draft` → UI updates immediately
2. **Sync**: Pull-to-refresh or manual trigger → reads all `draft`/`failed` visits → pushes each to Firestore → updates local status to `synced` or `failed`
3. **AI Summary**: User taps "Generate" → raw notes sent to Gemini API → structured JSON response parsed → stored alongside visit data
4. **Auth**: Firebase `onAuthStateChanged` listener persists session via AsyncStorage → auto-login on app restart

## Local Persistence Approach

- **AsyncStorage** with JSON serialization under a single key (`@visits`)
- All CRUD operations work offline — visits are created with `syncStatus: 'draft'`
- Theme preference stored separately under `@theme_preference`
- Firebase Auth session auto-persisted via `getReactNativePersistence(AsyncStorage)`

### Why AsyncStorage?
- Zero native module configuration needed in Expo managed workflow
- Simple key-value API perfect for the visit log use case
- Reliable persistence across app restarts and updates

## Sync Approach

```
Local (AsyncStorage)           Remote (Firestore)
    │                              │
    ├── Save visit (draft) ────────┤
    │                              │
    ├── Pull-to-refresh ──────────►│
    │   status: syncing            │
    │                              │
    ├── Success ◄──────────────────┤
    │   status: synced             │
    │                              │
    ├── Failure ◄──────────────────┤
    │   status: failed             │
    │   (retryable)                │
    └──────────────────────────────┘
```

- **Sync is user-triggered** via pull-to-refresh or manual "Sync Now" / "Retry Sync" buttons
- Each visit tracks its own `syncStatus`: `draft` → `syncing` → `synced` | `failed`
- Failed syncs are retryable from the visit detail screen
- Firestore path: `users/{userId}/visits/{visitId}` — scoped per user
- Conflict resolution: local version wins (last-write-wins)

## AI Integration Approach

- **Google Gemini 1.5 Flash** model via REST API (`generativelanguage.googleapis.com`)
- Prompt requests structured JSON output with: `meetingSummary`, `painPoints[]`, `actionItems[]`, `recommendedNextStep`
- Response is parsed and validated before storage
- Works on-demand — user triggers generation from the form or detail screen
- AI summary is stored locally with the visit and synced with it

## Tools Used

- **Expo** — managed workflow, dev server, build tooling
- **React Navigation** — stack + bottom tab navigation
- **Firebase JS SDK v12** — auth + Firestore
- **AI Coding Assistant** — used for initial code scaffolding and architecture design

## What Was Manually Corrected from AI-Generated Code

1. **Firebase Auth persistence import** — `getReactNativePersistence` required a `@ts-ignore` as the TypeScript types don't export it directly in Firebase v12, but it works at runtime
2. **TypeScript strict mode fixes** — added `skipLibCheck: true` and proper type annotations throughout
3. **Theme color system** — manually tuned color values to match the reference dark purple/navy design with neon purple accents, rather than using generic defaults
4. **Navigation structure** — adjusted the tab + stack navigator nesting to properly support deep navigation (list → detail → form → back)
5. **Validation logic** — conditional follow-up date requirement (only when outcome is "follow-up needed") was refined from initial AI suggestions
6. **Gemini API prompt engineering** — crafted the prompt to return clean JSON via `response_format`, added response cleaning/validation
