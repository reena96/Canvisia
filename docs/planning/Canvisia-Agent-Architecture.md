# Canvisia AI Agent - Architecture Documentation

This document provides detailed architecture diagrams for the Canvisia AI Canvas Agent using Mermaid.

## Table of Contents
1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Sequence Diagram](#sequence-diagram)
4. [Data Model](#data-model)
5. [File Structure](#file-structure)

---

## System Overview

High-level flow of AI command processing:

```mermaid
flowchart TB
    User[👤 User] -->|Types command| Input[AI Command Input]
    Input -->|"Cmd+K or click"| Lock{Multi-User Lock}

    Lock -->|Lock acquired| Context[Context Builder]
    Lock -->|Locked by other user| Busy[❌ Show: AI busy with UserX]

    Context -->|Canvas state| Claude[🤖 Claude 3.5 Sonnet API]
    Claude -->|Tool calls| Executor[Command Executor]

    Executor -->|create/update| Firestore[(Firestore)]
    Firestore -->|Real-time sync| Canvas[🎨 Canvas Update]

    Canvas -->|Success| Feedback[✅ Toast: Created 4 shapes]
    Executor -->|Release lock| Lock

    style User fill:#e1f5ff
    style Claude fill:#fff4e6
    style Firestore fill:#e8f5e9
    style Canvas fill:#f3e5f5
```

---

## Component Architecture

### Frontend Components

```mermaid
graph TB
    subgraph "UI Layer"
        Input[AICommandInput.tsx<br/>Text input + Send button]
        Status[AIStatusIndicator.tsx<br/>Loading/Success/Error]
    end

    subgraph "Hook Layer"
        Hook[useAI.ts<br/>sendCommand<br/>isProcessing<br/>isLocked<br/>lockOwner]
    end

    subgraph "Service Layer"
        Client[client.ts<br/>Anthropic SDK<br/>API calls]
        Orchestrator[orchestrator.ts<br/>Context builder<br/>Tool parser]
        Executor[executor.ts<br/>Execute tool calls<br/>Create/Update shapes]
        Lock[lock.ts<br/>Acquire/Release<br/>Multi-user coordination]
    end

    subgraph "External Services"
        Claude[Claude API<br/>11 Tools]
        RTDB[(RTDB<br/>aiLock)]
        FS[(Firestore<br/>shapes)]
    end

    Input --> Hook
    Status --> Hook
    Hook --> Client
    Hook --> Lock
    Client --> Claude
    Client --> Orchestrator
    Orchestrator --> Executor
    Executor --> FS
    Lock --> RTDB

    style Input fill:#bbdefb
    style Hook fill:#c8e6c9
    style Client fill:#fff9c4
    style Claude fill:#ffccbc
    style FS fill:#d1c4e9
    style RTDB fill:#d1c4e9
```

### Service Layer Detail

```mermaid
graph LR
    subgraph "src/services/ai/"
        Client[client.ts]
        Orchestrator[orchestrator.ts]
        Executor[executor.ts]
        Context[context.ts]
        Lock[lock.ts]
    end

    Client -->|Uses| Orchestrator
    Orchestrator -->|Uses| Context
    Orchestrator -->|Uses| Executor
    Client -->|Before call| Lock

    Context -->|Reads| Shapes[(Canvas Shapes)]
    Executor -->|Writes| Shapes
    Lock -->|Manages| LockDB[(AI Lock)]

    style Client fill:#e3f2fd
    style Orchestrator fill:#f3e5f5
    style Executor fill:#e8f5e9
    style Context fill:#fff3e0
    style Lock fill:#fce4ec
```

---

## Sequence Diagram

Complete flow from user command to canvas update:

```mermaid
sequenceDiagram
    actor User
    participant Input as AICommandInput
    participant Hook as useAI Hook
    participant Lock as aiLock Service
    participant Context as Context Builder
    participant Claude as Claude API
    participant Executor as Command Executor
    participant Firestore as Firestore

    User->>Input: Types "Create a blue circle"
    Input->>Hook: sendCommand(text)

    Note over Hook: Check if AI is busy
    Hook->>Lock: acquireAILock(canvasId, userId, command)

    alt Lock acquired
        Lock-->>Hook: true
        Hook->>Input: Show loading state

        Hook->>Context: buildContext(shapes)
        Context->>Firestore: Read current shapes
        Firestore-->>Context: shapes[]
        Context-->>Hook: Canvas state JSON

        Hook->>Claude: sendMessage(command, context, tools)
        Note over Claude: AI processes command<br/>Returns tool calls
        Claude-->>Hook: tool_calls: [create_shape(...)]

        Hook->>Executor: executeToolCalls(tool_calls)
        Executor->>Firestore: createShape(circle, blue, ...)
        Firestore-->>Executor: shape created
        Executor-->>Hook: success

        Hook->>Lock: releaseAILock(canvasId)
        Hook->>Input: Show success toast

        Note over Firestore: Real-time sync
        Firestore-->>User: Canvas updates with new shape

    else Lock not acquired (busy)
        Lock-->>Hook: false (locked by Alice)
        Hook->>Input: Show toast: "AI busy with Alice"
    end
```

### Multi-User Lock Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Idle: No AI command

    Idle --> CheckLock: User sends command

    CheckLock --> Acquired: Lock free
    CheckLock --> Waiting: Lock held by other user

    Waiting --> CheckLock: Wait 1s, retry
    Waiting --> Idle: User cancels

    Acquired --> Processing: Execute AI command
    Processing --> Releasing: Command complete
    Processing --> ReleasingError: Command error

    Releasing --> Idle: Lock released
    ReleasingError --> Idle: Lock released

    note right of CheckLock
        Check if lock age < 10s
        If > 10s, break stale lock
    end note

    note right of Processing
        1. Build context
        2. Call Claude API
        3. Execute tool calls
        4. Update Firestore
    end note
```

---

## Data Model

### Firestore Schema

```mermaid
erDiagram
    CANVAS ||--o{ SHAPE : contains
    CANVAS {
        string id
        string name
        string ownerId
        timestamp createdAt
        timestamp updatedAt
    }

    SHAPE {
        string id
        string canvasId
        string type
        number x
        number y
        number width
        number height
        number radius
        string color
        number rotation
        string content
        object metadata
        object connections
        string createdBy
        timestamp createdAt
    }

    SHAPE ||--o| METADATA : has
    METADATA {
        string nodeType
        number processTime
        number capacity
        number successRate
    }

    SHAPE ||--o| CONNECTIONS : has
    CONNECTIONS {
        string fromShapeId
        string toShapeId
    }
```

### RTDB Lock Structure

```mermaid
graph TD
    subgraph "RTDB: canvases/{canvasId}/aiLock"
        Lock[AI Lock Object]
    end

    Lock --> userId[userId: string]
    Lock --> userName[userName: string]
    Lock --> timestamp[timestamp: number]
    Lock --> command[command: string]

    style Lock fill:#ffebee
    style userId fill:#fff3e0
    style userName fill:#fff3e0
    style timestamp fill:#fff3e0
    style command fill:#fff3e0
```

---

## File Structure

```mermaid
graph TB
    subgraph "src/"
        subgraph "components/ai/"
            Input[AICommandInput.tsx]
            Status[AIStatusIndicator.tsx]
        end

        subgraph "hooks/"
            Hook[useAI.ts]
        end

        subgraph "services/ai/"
            Client[client.ts]
            Orchestrator[orchestrator.ts]
            Executor[executor.ts]
            Context[context.ts]
            Lock[lock.ts]
        end

        subgraph "types/"
            Types[ai.ts<br/>shapes.ts]
        end

        subgraph "utils/"
            Helpers[aiHelpers.ts<br/>canvasQuery.ts<br/>connectionUtils.ts]
        end
    end

    Input --> Hook
    Status --> Hook
    Hook --> Client
    Hook --> Lock
    Client --> Orchestrator
    Orchestrator --> Context
    Orchestrator --> Executor
    Executor --> Helpers
    Context --> Helpers

    Client --> Types
    Executor --> Types

    style Input fill:#e3f2fd
    style Hook fill:#c8e6c9
    style Client fill:#fff9c4
    style Types fill:#f3e5f5
```

---

## AI Tool Definitions

The 11 AI tools available to Claude:

```mermaid
mindmap
  root((AI Tools<br/>11 total))
    Creation
      create_shape
      create_text
      create_arrow
    Manipulation
      move_element
      resize_element
      rotate_element
    Layout
      arrange_elements
      align_elements
    Complex
      create_flowchart
      create_ui_component
      create_diagram
```

### Tool Call Flow

```mermaid
flowchart LR
    Command[User Command] --> Claude[Claude API]
    Claude --> Parse{Parse Intent}

    Parse -->|Simple| Single[Single Tool Call]
    Parse -->|Complex| Multi[Multiple Tool Calls]

    Single --> Execute1[Execute Tool]
    Multi --> Execute2[Execute Tools Sequentially]

    Execute1 --> Result[Update Canvas]
    Execute2 --> Result

    Result --> Sync[Real-time Sync]
    Sync --> Users[All Users See Update]

    style Command fill:#e1f5ff
    style Claude fill:#fff4e6
    style Result fill:#e8f5e9
```

---

## Technology Stack Diagram

```mermaid
graph TB
    subgraph "Frontend"
        React[React 18]
        TS[TypeScript]
        Konva[React-Konva]
        Vite[Vite]
    end

    subgraph "AI Layer"
        Anthropic[Anthropic SDK]
        Claude[Claude 3.5 Sonnet]
    end

    subgraph "Backend"
        Firebase[Firebase]
        Firestore[Firestore]
        RTDB[Realtime Database]
        Auth[Firebase Auth]
    end

    subgraph "Future"
        GSAP[GSAP<br/>Animation]
        SimEngine[Simulation Engine]
    end

    React --> Anthropic
    Anthropic --> Claude
    React --> Firestore
    React --> RTDB
    React --> Auth
    Konva --> GSAP
    GSAP --> SimEngine

    style React fill:#61dafb
    style Claude fill:#ffb366
    style Firebase fill:#ffa000
    style GSAP fill:#88ce02
```

---

## Performance & Optimization

```mermaid
graph TB
    subgraph "Performance Targets"
        Target1[AI Response < 2s]
        Target2[Canvas 60 FPS]
        Target3[Lock timeout 10s]
    end

    subgraph "Optimization Strategies"
        Opt1[Client-side AI<br/>No backend hop]
        Opt2[Context caching<br/>Limit to 50 shapes]
        Opt3[Batch operations<br/>Multi-element commands]
        Opt4[Optimistic updates<br/>Immediate feedback]
    end

    Target1 --> Opt1
    Target2 --> Opt4
    Target3 --> Opt3
    Opt2 --> Target1

    style Target1 fill:#c8e6c9
    style Target2 fill:#c8e6c9
    style Target3 fill:#c8e6c9
    style Opt1 fill:#fff9c4
    style Opt2 fill:#fff9c4
    style Opt3 fill:#fff9c4
    style Opt4 fill:#fff9c4
```

---

## Security Considerations

```mermaid
graph TB
    subgraph "Current (Day 1)"
        ClientSide[Client-side API key]
        EnvLocal[.env.local only]
        NoCommit[Not in git]
    end

    subgraph "Future (Production)"
        Functions[Firebase Cloud Functions]
        ServerKey[Server-side API key]
        JWT[JWT verification]
    end

    ClientSide --> Functions
    EnvLocal --> ServerKey
    NoCommit --> JWT

    style ClientSide fill:#ffebee
    style Functions fill:#e8f5e9
    style EnvLocal fill:#ffebee
    style ServerKey fill:#e8f5e9
```

---

## Error Handling Flow

```mermaid
flowchart TD
    Start[User Command] --> Lock{Acquire Lock?}

    Lock -->|No| Busy[Show: AI busy]
    Busy --> End[User waits]

    Lock -->|Yes| API{API Call Success?}

    API -->|No| APIError[Show: API Error<br/>Suggest retry]
    APIError --> ReleaseLock[Release Lock]

    API -->|Yes| Parse{Parse Tool Calls?}

    Parse -->|No| ParseError[Show: Could not understand<br/>Suggest rephrase]
    ParseError --> ReleaseLock

    Parse -->|Yes| Execute{Execute Success?}

    Execute -->|No| ExecError[Show: Failed to create<br/>Show error details]
    ExecError --> ReleaseLock

    Execute -->|Yes| Success[Show: Success toast<br/>Update canvas]
    Success --> ReleaseLock

    ReleaseLock --> End

    style Start fill:#e1f5ff
    style Success fill:#c8e6c9
    style Busy fill:#fff9c4
    style APIError fill:#ffebee
    style ParseError fill:#ffebee
    style ExecError fill:#ffebee
```

---

## Future: Simulation Board Architecture

Preview of V3 Simulation features:

```mermaid
graph TB
    subgraph "Current (V1)"
        AI[AI Agent]
        Canvas[Canvas]
    end

    subgraph "Future (V3)"
        Sim[Simulation Command]
        Engine[Simulation Engine]
        GSAP[GSAP Animation]
        Tokens[Token Renderer]
        Metrics[Metrics Dashboard]
    end

    AI -->|"Create flowchart"| Canvas
    Canvas -->|"Annotated nodes"| Sim

    Sim --> Engine
    Engine --> GSAP
    GSAP --> Tokens
    Engine --> Metrics

    Tokens -->|Render on canvas| Canvas

    style AI fill:#e3f2fd
    style Sim fill:#fff9c4
    style Engine fill:#c8e6c9
    style GSAP fill:#88ce02
    style Metrics fill:#f3e5f5
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        LocalHost[localhost:5173<br/>Vite Dev Server]
        Emulators[Firebase Emulators]
    end

    subgraph "Production"
        Hosting[Firebase Hosting]
        CDN[Global CDN]
    end

    subgraph "Services (Both Envs)"
        Firestore[(Firestore)]
        RTDB[(Realtime DB)]
        Auth[Firebase Auth]
    end

    LocalHost --> Emulators
    Emulators --> Firestore
    Emulators --> RTDB

    Hosting --> CDN
    CDN --> Firestore
    CDN --> RTDB
    CDN --> Auth

    style LocalHost fill:#e1f5ff
    style Hosting fill:#c8e6c9
    style Firestore fill:#f3e5f5
```

---

## Summary

This architecture provides:

✅ **Scalable** - Client-side AI can handle multiple users with lock coordination
✅ **Fast** - Sub-2s AI responses with optimistic updates
✅ **Extensible** - Metadata & connections support future simulation features
✅ **Collaborative** - Real-time sync with multi-user lock system
✅ **Testable** - Modular services enable unit and integration testing

**Next Steps:**
1. Implement PR #13 (AI Setup)
2. Add PR #14-17 (Commands)
3. Test multi-user scenarios
4. Plan V3 Simulation features
