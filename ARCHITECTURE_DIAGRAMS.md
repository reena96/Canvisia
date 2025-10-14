# Canvisia - Architecture Diagrams

This document contains Mermaid diagrams showing the complete system architecture, data flows, and technology interactions.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        UI[React App<br/>Vite + TypeScript]
        Canvas[Konva.js Canvas<br/>react-konva]
        AuthUI[Authentication UI<br/>Google Sign-In]
        AIPanel[AI Panel<br/>Natural Language Input]
    end

    subgraph "Firebase Platform"
        Hosting[Firebase Hosting<br/>Static Assets]
        Functions[Cloud Functions<br/>Node.js Runtime]
    end

    subgraph "Firebase Services"
        Auth[Firebase Auth<br/>Google OAuth]
        Firestore[Cloud Firestore<br/>Objects & Metadata]
        RTDB[Realtime Database<br/>Cursor Positions]
    end

    subgraph "AI Services"
        Claude[Anthropic Claude API<br/>Function Calling]
    end

    UI --> Canvas
    UI --> AuthUI
    UI --> AIPanel

    UI -->|Deploy| Hosting
    Hosting -->|Serve| UI

    AuthUI -->|Sign In/Out| Auth
    Auth -->|User Session| AuthUI

    Canvas -->|Create/Update Objects| Firestore
    Firestore -->|Real-time Updates| Canvas

    Canvas -->|Cursor Movement| RTDB
    RTDB -->|Other Users' Cursors| Canvas

    AIPanel -->|Command| Functions
    Functions -->|Function Calls| Claude
    Claude -->|Actions| Functions
    Functions -->|Execute| Firestore

    style UI fill:#61dafb
    style Canvas fill:#98d8f0
    style Auth fill:#ffca28
    style Firestore fill:#ffca28
    style RTDB fill:#ffca28
    style Claude fill:#d4a373
    style Functions fill:#ffca28
    style Hosting fill:#ffca28
```

---

## 2. Frontend Component Architecture

```mermaid
graph TB
    subgraph AppRoot["App.tsx"]
        App[App Component<br/>Root]
    end

    subgraph Providers["Providers"]
        AuthProvider[AuthProvider<br/>Context]
    end

    subgraph Layout["Layout"]
        Header[Header<br/>User Info and Logout]
        Sidebar[Sidebar<br/>Tools and Settings]
    end

    subgraph CanvasLayer["Canvas Layer"]
        CanvasContainer[Canvas.tsx<br/>Stage Container]
        Stage[Konva Stage<br/>Pan Zoom Drag]
        Layer[Konva Layer<br/>Shape Container]
        ShapeRenderer[ShapeRenderer<br/>Rect Circle Line Text]
        Controls[CanvasControls<br/>Zoom Buttons]
    end

    subgraph Collaboration["Collaboration"]
        CursorOverlay[CursorOverlay<br/>Other Users Cursors]
        Presence[PresenceIndicator<br/>Active Users]
        UserList[UserList<br/>Online Users]
    end

    subgraph AIPanel["AI Panel"]
        AIPanelComp[AIPanel<br/>Command Interface]
        AIInput[AIInput<br/>Text Input]
        AIStatus[AIStatusIndicator<br/>Loading Success Error]
    end

    subgraph ToolbarGroup["Toolbar"]
        Toolbar[Toolbar<br/>Shape Selection]
    end

    App --> AuthProvider
    AuthProvider --> Header
    AuthProvider --> Sidebar
    AuthProvider --> CanvasContainer
    AuthProvider --> AIPanelComp

    CanvasContainer --> Stage
    CanvasContainer --> CursorOverlay
    CanvasContainer --> Controls

    Stage --> Layer
    Layer --> ShapeRenderer

    Header --> Presence
    Sidebar --> UserList
    Sidebar --> Toolbar

    AIPanelComp --> AIInput
    AIPanelComp --> AIStatus

    style App fill:#61dafb
    style AuthProvider fill:#98d8f0
    style Stage fill:#d4a373
    style Layer fill:#d4a373
    style AIPanelComp fill:#ffca28
```

---

## 3. Data Flow: Authentication

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant AuthProvider
    participant Firebase Auth
    participant Firestore

    User->>Browser: Click "Sign in with Google"
    Browser->>AuthProvider: signInWithGoogle()
    AuthProvider->>Firebase Auth: signInWithPopup(GoogleProvider)

    Firebase Auth->>User: Show Google OAuth popup
    User->>Firebase Auth: Authorize

    Firebase Auth->>AuthProvider: Return user object
    AuthProvider->>AuthProvider: Update auth state
    AuthProvider->>Browser: Re-render with user

    AuthProvider->>Firestore: Create/update user presence
    Note over Firestore: users/{userId}<br/>{name, color, isActive: true}

    Browser->>User: Show canvas interface

    Note over Browser,Firestore: User is now authenticated<br/>and presence is tracked
```

---

## 4. Data Flow: Real-Time Object Sync

```mermaid
sequenceDiagram
    participant User A
    participant Canvas A
    participant Firestore
    participant Canvas B
    participant User B

    User A->>Canvas A: Click to create rectangle

    Canvas A->>Canvas A: Optimistic update<br/>(show immediately)

    Canvas A->>Firestore: createShape(canvasId, shape)
    Note over Firestore: canvases/{id}/objects/{shapeId}<br/>{type, x, y, width, height, color}

    Firestore->>Canvas A: Write confirmed

    Firestore-->>Canvas B: onSnapshot() triggered
    Note over Canvas B: Real-time listener

    Canvas B->>Canvas B: Update shapes state
    Canvas B->>User B: Render new rectangle

    Note over User A,User B: Both users see the rectangle<br/>within ~100ms
```

---

## 5. Data Flow: Real-Time Cursor Sync

```mermaid
sequenceDiagram
    participant User A
    participant Canvas A
    participant RTDB
    participant Canvas B
    participant User B

    loop Every 50ms (throttled)
        User A->>Canvas A: Move mouse
        Canvas A->>Canvas A: Throttle update
        Canvas A->>RTDB: Update cursor position
        Note over RTDB: cursors/{canvasId}/{userId}<br/>{x, y, timestamp}
    end

    RTDB-->>Canvas B: onValue() triggered
    Note over Canvas B: Real-time listener

    Canvas B->>Canvas B: Update cursor positions
    Canvas B->>User B: Render User A's cursor

    Note over User A,User B: Cursor latency <50ms
    Note over RTDB: Uses RTDB not Firestore<br/>for cost optimization
```

---

## 6. Data Flow: AI Command Execution (with Security)

```mermaid
sequenceDiagram
    participant User
    participant AIPanel
    participant Cloud Function
    participant Firebase Auth
    participant Claude API
    participant Firestore
    participant Canvas

    User->>AIPanel: Type "create a red circle"
    AIPanel->>AIPanel: Get Firebase Auth JWT
    AIPanel->>Cloud Function: POST executeAICommand<br/>Authorization: Bearer {JWT}
    Note over Cloud Function: Firebase Cloud Function

    Cloud Function->>Firebase Auth: Verify JWT token
    Firebase Auth->>Cloud Function: Token valid, return userId

    Cloud Function->>Cloud Function: Get canvas state from Firestore
    Cloud Function->>Claude API: Send prompt + canvas context
    Note over Claude API: Function calling enabled<br/>API key server-side only

    Claude API->>Claude API: Parse intent
    Claude API->>Cloud Function: Return function call
    Note over Cloud Function: {function: "createShape",<br/>args: {type: "circle", color: "red"}}

    Cloud Function->>Firestore: createShape() via Admin SDK
    Note over Firestore: canvases/{id}/objects/{shapeId}

    Firestore-->>Canvas: onSnapshot() triggered
    Canvas->>Canvas: Render new circle

    Cloud Function->>AIPanel: Success response
    AIPanel->>User: Show "Created red circle ✓"

    Note over User,Canvas: AI-created object syncs<br/>to all users via Firestore
    Note over Cloud Function,Claude API: ✅ Claude API key never<br/>exposed to client
    Note over Cloud Function: Firebase Cloud Function<br/>no credential setup needed
```

---

## 7. Firebase Data Structure

```mermaid
graph TB
    subgraph "Cloud Firestore"
        Canvases[canvases/]
        Canvas1[canvasId/]
        Metadata[metadata<br/>name, createdAt, ownerId]

        Objects[objects/]
        Object1[objectId/<br/>type, x, y, width, height,<br/>color, rotation, zIndex]

        Users[users/]
        User1[userId/<br/>name, color, lastSeen, isActive]
    end

    subgraph "Realtime Database"
        Cursors[cursors/]
        CanvasCursors[canvasId/]
        UserCursor[userId/<br/>x, y, timestamp]
    end

    Canvases --> Canvas1
    Canvas1 --> Metadata
    Canvas1 --> Objects
    Canvas1 --> Users

    Objects --> Object1
    Users --> User1

    Cursors --> CanvasCursors
    CanvasCursors --> UserCursor

    style Canvases fill:#ffca28
    style Objects fill:#98d8f0
    style Users fill:#61dafb
    style Cursors fill:#d4a373
```

---

## 8. Service Layer Architecture

```mermaid
graph TB
    subgraph "React Components"
        Components[React Components]
    end

    subgraph "Hooks Layer"
        useAuth[useAuth<br/>Authentication state]
        useCanvas[useCanvas<br/>Canvas state]
        useFirestore[useFirestore<br/>Firestore listeners]
        useCursors[useCursors<br/>Cursor sync]
        usePresence[usePresence<br/>User presence]
        useAI[useAI<br/>AI commands]
    end

    subgraph "Service Layer"
        AuthService[auth.ts<br/>signIn, signOut, getCurrentUser]
        FirestoreService[firestore.ts<br/>createShape, updateShape, deleteShape]
        RTDBService[rtdb.ts<br/>updateCursor, subscribeToCursors]
        ClaudeService[claude.ts<br/>executeCommand]
    end

    subgraph "Config Layer"
        FirebaseConfig[firebase.config.ts<br/>Firebase initialization]
        CanvasConfig[canvas.config.ts<br/>Canvas constants]
    end

    subgraph "Utilities"
        CanvasUtils[canvasUtils.ts<br/>screenToCanvas, clampZoom]
        ShapeDefaults[shapeDefaults.ts<br/>Default shape properties]
        AIHelpers[aiHelpers.ts<br/>Schema validation]
    end

    Components --> useAuth
    Components --> useCanvas
    Components --> useFirestore
    Components --> useCursors
    Components --> usePresence
    Components --> useAI

    useAuth --> AuthService
    useCanvas --> CanvasUtils
    useFirestore --> FirestoreService
    useCursors --> RTDBService
    useAI --> ClaudeService

    AuthService --> FirebaseConfig
    FirestoreService --> FirebaseConfig
    RTDBService --> FirebaseConfig

    FirestoreService --> ShapeDefaults
    ClaudeService --> AIHelpers

    style Components fill:#61dafb
    style useAuth fill:#98d8f0
    style useCanvas fill:#98d8f0
    style useFirestore fill:#98d8f0
    style AuthService fill:#d4a373
    style FirestoreService fill:#d4a373
```

---

## 9. Type System Architecture

```mermaid
graph TB
    subgraph "Core Types"
        User["User<br/>{uid, email, displayName,<br/>photoURL, color}"]
        Canvas["Canvas<br/>{id, name, createdAt,<br/>ownerId}"]
        Shape["Shape (Base)<br/>{id, type, x, y,<br/>createdBy, updatedAt}"]
    end

    subgraph "Shape Types"
        Rectangle["Rectangle<br/>{...Shape, width, height,<br/>fill, stroke}"]
        Circle["Circle<br/>{...Shape, radius,<br/>fill, stroke}"]
        Line["Line<br/>{...Shape, x2, y2,<br/>stroke, strokeWidth}"]
        Text["Text<br/>{...Shape, text, fontSize,<br/>fontFamily, fill}"]
    end

    subgraph "State Types"
        AuthState["AuthState<br/>{user: User | null,<br/>loading: boolean}"]
        CanvasState["CanvasState<br/>{shapes: Shape[],<br/>selectedIds: string[]}"]
        CursorState["CursorState<br/>{userId: string,<br/>x: number, y: number}"]
        PresenceState["PresenceState<br/>{users: User[],<br/>onlineCount: number}"]
    end

    subgraph "AI Types"
        AICommand["AICommand<br/>{prompt: string,<br/>canvasId: string}"]
        AIFunction["AIFunctionCall<br/>{name: string,<br/>arguments: object}"]
        AIResponse["AIResponse<br/>{success: boolean,<br/>message: string}"]
    end

    Shape --> Rectangle
    Shape --> Circle
    Shape --> Line
    Shape --> Text

    User --> AuthState
    User --> PresenceState

    Shape --> CanvasState
    User --> CursorState

    AICommand --> AIFunction
    AIFunction --> AIResponse

    style Shape fill:#61dafb
    style User fill:#98d8f0
    style AICommand fill:#ffca28
```

---

## 10. Deployment & Infrastructure

```mermaid
graph TB
    subgraph "Development"
        Dev[Developer Machine<br/>npm run dev]
        DevEnv[.env.local<br/>Local secrets]
        Emulator[Firebase Emulators<br/>Auth, Firestore, RTDB, Functions]
    end

    subgraph "Version Control"
        GitHub[GitHub Repository<br/>github.com/reena96/Canvisia]
    end

    subgraph "Firebase Platform"
        Build[Build Process<br/>Vite build]
        Hosting[Firebase Hosting<br/>Global CDN]
        Functions[Cloud Functions<br/>Node.js runtime]
        FunctionsConfig[Functions Config<br/>Secrets via Firebase CLI]
    end

    subgraph "Production Firebase Services"
        ProdAuth[Firebase Auth<br/>Production]
        ProdFirestore[Cloud Firestore<br/>Production]
        ProdRTDB[Realtime Database<br/>Production]
    end

    subgraph "External Services"
        ProdClaude[Claude API<br/>Production]
        GoogleOAuth[Google OAuth<br/>Identity Provider]
    end

    subgraph "Users"
        Browser1[User Browser 1]
        Browser2[User Browser 2]
        Browser3[User Browser N]
    end

    Dev -->|git push| GitHub
    GitHub -->|firebase deploy| Build
    Build --> Hosting
    Build --> Functions

    Dev --> Emulator
    DevEnv --> Dev

    FunctionsConfig --> Functions

    Browser1 -->|HTTPS| Hosting
    Browser2 -->|HTTPS| Hosting
    Browser3 -->|HTTPS| Hosting

    Hosting -->|static assets| Browser1
    Browser1 -->|API calls| Functions
    Functions --> ProdClaude

    Browser1 --> ProdAuth
    Browser1 --> ProdFirestore
    Browser1 --> ProdRTDB
    Functions --> ProdAuth
    Functions --> ProdFirestore

    ProdAuth --> GoogleOAuth

    style Dev fill:#98d8f0
    style GitHub fill:#333333
    style Hosting fill:#ffca28
    style Functions fill:#ffca28
    style ProdAuth fill:#ffca28
    style ProdClaude fill:#d4a373
```

---

## 11. User Interaction Flow

```mermaid
stateDiagram-v2
    [*] --> NotAuthenticated

    NotAuthenticated --> Authenticating: Click "Sign in with Google"
    Authenticating --> Authenticated: Success
    Authenticating --> NotAuthenticated: Error/Cancel

    Authenticated --> LoadingCanvas: Fetch canvas data
    LoadingCanvas --> CanvasReady: Data loaded

    CanvasReady --> Creating: Click to create shape
    Creating --> CanvasReady: Shape created

    CanvasReady --> Selecting: Click on shape
    Selecting --> Dragging: Drag shape
    Selecting --> Resizing: Drag resize handle
    Selecting --> Rotating: Drag rotate handle
    Selecting --> CanvasReady: Click background

    Dragging --> CanvasReady: Release
    Resizing --> CanvasReady: Release
    Rotating --> CanvasReady: Release

    CanvasReady --> AICommand: Type AI command
    AICommand --> AIProcessing: Submit
    AIProcessing --> CanvasReady: Success
    AIProcessing --> CanvasReady: Error

    CanvasReady --> Panning: Drag background
    Panning --> CanvasReady: Release

    CanvasReady --> Zooming: Mouse wheel
    Zooming --> CanvasReady: Complete

    Authenticated --> NotAuthenticated: Sign out

    note right of CanvasReady
        Real-time updates from
        other users happen
        continuously
    end note

    note right of AIProcessing
        Server-side function
        calls Claude API
    end note
```

---

## 12. Performance Optimization Flow

```mermaid
graph TB
    subgraph "Rendering Pipeline"
        Input[User Input<br/>Mouse/Keyboard]
        Throttle[Throttle Updates<br/>10-20 updates/sec]
        Optimistic[Optimistic Update<br/>Update local state immediately]
        Render[Konva Render<br/>React components]
        ViewportCull[Viewport Culling<br/>Only render visible shapes]
    end

    subgraph "Network Layer"
        Firestore[Firestore Write<br/>Debounced]
        RTDB[RTDB Write<br/>Throttled cursors]
    end

    subgraph "Optimization Techniques"
        Memo[React.memo<br/>Prevent unnecessary re-renders]
        Callback[useCallback<br/>Stable event handlers]
        Batching[Batch Updates<br/>Multiple changes at once]
    end

    Input --> Throttle
    Throttle --> Optimistic
    Optimistic --> Render
    Render --> ViewportCull

    Optimistic --> Firestore
    Optimistic --> RTDB

    Render --> Memo
    Render --> Callback
    Firestore --> Batching

    style Throttle fill:#98d8f0
    style Optimistic fill:#61dafb
    style ViewportCull fill:#ffca28
    style Memo fill:#d4a373
```

---

## 13. Error Handling & Recovery

```mermaid
graph TB
    subgraph "Error Sources"
        NetworkError[Network Error<br/>Connection lost]
        FirebaseError[Firebase Error<br/>Permission denied, quota]
        ClaudeError[Claude API Error<br/>Rate limit, timeout]
        ValidationError[Validation Error<br/>Invalid data]
    end

    subgraph "Error Handlers"
        GlobalHandler[Global Error Boundary<br/>React Error Boundary]
        NetworkHandler[Offline Detection<br/>window.online/offline]
        APIHandler[API Error Handler<br/>Retry logic]
        ValidationHandler[Schema Validator<br/>Zod/Yup]
    end

    subgraph "User Feedback"
        Toast[Toast Notification<br/>Error message]
        Banner[Offline Banner<br/>You are offline]
        Retry[Retry Button<br/>Try again]
        Fallback[Fallback UI<br/>Error state]
    end

    subgraph "Recovery Strategies"
        RetryLogic[Exponential Backoff<br/>Retry failed requests]
        QueueSync[Queue Sync<br/>Sync when online]
        CacheRestore[Restore from Cache<br/>Local storage]
    end

    NetworkError --> NetworkHandler
    FirebaseError --> APIHandler
    ClaudeError --> APIHandler
    ValidationError --> ValidationHandler

    NetworkHandler --> Banner
    NetworkHandler --> QueueSync

    APIHandler --> Toast
    APIHandler --> RetryLogic

    ValidationHandler --> Toast

    GlobalHandler --> Fallback

    RetryLogic --> Retry
    QueueSync --> CacheRestore

    style NetworkError fill:#ff6b6b
    style FirebaseError fill:#ff6b6b
    style Toast fill:#ffca28
    style RetryLogic fill:#61dafb
```

---

## 14. Security Architecture

```mermaid
graph TB
    subgraph "Client Side"
        ClientApp[React Application]
        PublicKeys[Public API Keys<br/>VITE_FIREBASE_*]
    end

    subgraph "Authentication Layer"
        GoogleOAuth[Google OAuth<br/>Identity Provider]
        FirebaseAuth[Firebase Auth<br/>JWT Tokens]
    end

    subgraph "Authorization Layer"
        SecurityRules[Firestore Security Rules<br/>request.auth != null]
        RTDBRules[RTDB Security Rules<br/>auth.uid != null]
    end

    subgraph "Server Side"
        CloudFunc[Firebase Cloud Functions<br/>executeAICommand]
        SecretKeys[Secret Keys<br/>CLAUDE_API_KEY]
    end

    subgraph "Data Layer"
        Firestore[Cloud Firestore]
        RTDB[Realtime Database]
    end

    subgraph "External APIs"
        ClaudeAPI[Claude API]
    end

    ClientApp -->|Sign in request| GoogleOAuth
    GoogleOAuth -->|ID Token| FirebaseAuth
    FirebaseAuth -->|JWT| ClientApp

    ClientApp -->|Read/Write + JWT| SecurityRules
    SecurityRules -->|Validated| Firestore

    ClientApp -->|Read/Write + JWT| RTDBRules
    RTDBRules -->|Validated| RTDB

    ClientApp -->|POST executeAICommand + JWT| CloudFunc
    CloudFunc -->|API Key| ClaudeAPI
    CloudFunc -->|Write as admin| Firestore

    PublicKeys -.->|Not secret| ClientApp
    SecretKeys -.->|Protected| CloudFunc

    style SecurityRules fill:#ff6b6b
    style RTDBRules fill:#ff6b6b
    style SecretKeys fill:#ffca28
    style FirebaseAuth fill:#61dafb
```

---

## 15. Technology Stack Summary

```mermaid
mindmap
  root((Canvisia))
    Frontend
      React 18
        TypeScript
        Vite
        react-router-dom
      UI/Canvas
        Konva.js
        react-konva
      Styling
        Tailwind CSS
        lucide-react icons
      State Management
        Zustand
        React Context for Auth
    Backend
      Firebase
        Cloud Firestore
        Realtime Database
        Firebase Auth
        Firebase Emulators dev
        Cloud Functions
      Serverless
        Firebase Cloud Functions
        Node.js runtime
    AI/ML
      Anthropic Claude
        Function Calling
        Natural Language
    Testing
      Vitest
        Unit Tests
        Integration Tests
      Testing Library
        @testing-library/react
        @testing-library/user-event
      Firebase
        Firebase Emulator
    DevOps
      Git
        GitHub
        Git Hooks
      CI/CD
        GitHub Actions
        Firebase Deploy
      Security
        Environment Variables
        .gitignore
        Security Rules
    Development
      TypeScript
        Type Safety
        Interfaces
      ESLint
        Code Quality
      Prettier
        Code Formatting
```

---

## Key Architecture Decisions

### 1. **Konva.js over PixiJS**
- **Reason:** Declarative React integration, built-in features (drag/drop, resize), saves 10-15 hours
- **Trade-off:** Slightly lower max object count (300-500 vs 1000+), but sufficient with viewport culling

### 2. **Hybrid Firebase Approach**
- **Firestore:** Objects, metadata (precise queries, automatic scaling)
- **RTDB:** Cursor positions (cost optimization for high-frequency updates)
- **Why:** Cursor updates at 20/sec would cost $3.89/hour with Firestore, nearly free with RTDB

### 3. **Server-Side AI Processing**
- **Pattern:** Client → Firebase Cloud Function → Claude API → Firestore
- **Why:** Protects Claude API key, enables rate limiting, adds validation layer, native Firebase integration

### 4. **Optimistic Updates**
- **Strategy:** Update local state immediately, sync to Firestore in background
- **Why:** 60 FPS user experience, feels instant even with network latency

### 5. **Firebase Emulator for Testing**
- **Why:** Integration tests use real Firebase behavior without mocks
- **Benefit:** Catches Firestore-specific issues (listeners, eventual consistency, rate limits)

---

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Frame Rate | 60 FPS | Viewport culling, React.memo, throttling |
| Cursor Sync | <50ms | RTDB + throttling (20 updates/sec) |
| Object Sync | <100ms | Firestore + optimistic updates |
| Max Objects | 500+ | Viewport culling (only render visible) |
| Concurrent Users | 5+ | Firebase auto-scaling |
| AI Response | <2 sec | Claude function calling, caching |

---

## Next Steps

1. **PR #1:** Implement project setup with these patterns
2. **PR #2:** Set up Firebase services with data structure from Diagram 7
3. **PR #3:** Build Canvas with Konva.js as shown in Diagram 2
4. **PR #4-18:** Follow architecture patterns from these diagrams

---

**Generated:** 2025-10-13
**Repository:** https://github.com/reena96/Canvisia
**Based on:** CollabCanvas-PRD.md, TASK_LIST_WITH_TESTS.md
