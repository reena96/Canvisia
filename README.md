# Canvisia

A real-time collaborative design tool inspired by Figma, with AI-assisted design capabilities.

## Links
- **Launch Canvisia:** https://canvisia-ab47b.web.app
- **Repository:** https://github.com/reena96/Canvisia
- Documentation: See `../docs/` directory for organized documentation
  - Planning: `../docs/planning/` (PRD, Architecture Diagrams) https://github.com/reena96/Canvisia/tree/main/docs/planning
  - Tasks: `../docs/tasks/` (Task Lists) https://github.com/reena96/Canvisia/tree/main/docs/tasks
  - Testing: `../docs/testing/` (Test Documentation) https://github.com/reena96/Canvisia/tree/main/docs/testing
  - Setup: `../docs/setup/` (Environment Setup, Security Guide) https://github.com/reena96/Canvisia/tree/main/docs/setup

## Project Overview

Canvisia enables multiple users to work simultaneously on a shared canvas with real-time synchronization and AI-powered design assistance. Built as a 7-day sprint project for Gauntlet AI.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Canvas Rendering:** Konva.js + react-konva
- **State Management:** Zustand (canvas state), React Context (auth)
- **Backend:** Firebase (Hosting, Cloud Functions, Firestore, Realtime Database, Auth)
- **AI:** Anthropic Claude API (via Firebase Cloud Functions)
- **Styling:** CSS (will add Tailwind CSS in later PRs)

## Features

### MVP (24 Hours) - COMPLETE
- ✅ Infinite canvas with pan/zoom and Figma-style navigation
- ✅ Rectangle shape creation and manipulation
- ✅ Drag and move objects with real-time sync
- ✅ Real-time collaboration between multiple users
- ✅ Multiplayer cursors with name labels and presence awareness
- ✅ Google Sign-In authentication with Firebase
- ✅ Deployed to Firebase Hosting and publicly accessible
- ✅ Professional toolbar with integrated zoom controls

### Additional Features in MVP
Beyond the core MVP requirements, we've implemented several enhanced features:

**Enhanced Toolbar & Navigation:**
- ✅ Hand tool for dedicated panning mode (Figma-style workflow)
- ✅ Tooltips on all toolbar buttons for improved discoverability
- ✅ Collapsible shape groups (Circles, Polygons, Lines & Connectors)
- ✅ Tool toggle functionality (click to deselect active tool)
- ✅ Auto-switch to select tool after shape creation

**Comprehensive Shape Library:**
- ✅ Circles: Circle, Ellipse, Rounded Rectangle, Cylinder
- ✅ Polygons: Rectangle, Diamond, Triangle, Pentagon, Hexagon, Star
- ✅ Lines & Connectors: Line, Arrow, Bidirectional Arrow

**Advanced Text Editing (Figma-style):**
- ✅ Drag-and-drop text creation with visual preview
- ✅ Auto-enter edit mode on text creation
- ✅ Floating formatting toolbar with comprehensive controls:
  - Font family selection (10 fonts including custom Google Fonts)
  - Font size adjustment
  - Bold, Italic, Underline styles
  - Text alignment (left, center, right, justify)
  - Line height control
  - Color picker
- ✅ Keyboard shortcuts (Cmd/Ctrl+B, I, U for formatting)
- ✅ Placeholder text with auto-delete for empty text boxes
- ✅ Auto-width text boxes with dynamic resizing
- ✅ Tightly positioned toolbar (1px gap for precise control)

**User Experience Enhancements:**
- ✅ Spacebar for temporary pan mode
- ✅ Non-blocking shape creation (expanded menus stay open)
- ✅ Visual feedback with "Add text" preview following cursor

### Full Project (7 Days)
- Resize and rotate objects
- Multi-select and layer management
- AI-assisted design (6+ command types)
- Performance optimizations (60 FPS with 500+ objects)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Firebase account (will set up in PR #2)
- Claude API key (will set up in PR #13)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Canvisia.git
   cd Canvisia/canvisia
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase config (after creating Firebase project in PR #2)
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run emulators` - Start Firebase emulators (for integration testing)

## Project Structure

```
canvisia/
├── src/
│   ├── components/      # React components (auth, canvas, collaboration, AI)
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Firebase and API services
│   ├── stores/         # Zustand stores
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration files
│   ├── App.tsx         # Root component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
└── ...config files
```

## Development Roadmap

This project follows an 18-PR implementation plan:

- **PR #1:** ✅ Project Setup & Configuration (Current)
- **PR #2-8:** MVP Features (24-hour checkpoint)
- **PR #9-12:** Full Canvas Features
- **PR #13-17:** AI Integration
- **PR #18:** Documentation & Submission

See `../docs/tasks/TASK_LIST.md` for detailed implementation plan.

## Performance Targets

- 60 FPS during all interactions
- Support 500+ total objects (with viewport culling)
- Cursor sync latency: <50ms
- Object sync latency: <100ms
- 5+ concurrent users

## Contributing

This is a sprint project for Gauntlet AI. Implementation follows the structured PR plan in `../docs/tasks/TASK_LIST.md`.

## License

MIT


- **Live Demo:** https://canvisia-ab47b.web.app
- **Repository:** https://github.com/reena96/Canvisia
- Documentation: See `../docs/` directory for organized documentation
  - Planning: `../docs/planning/` (PRD, Architecture Diagrams)
  - Tasks: `../docs/tasks/` (Task Lists)
  - Testing: `../docs/testing/` (Test Documentation)
  - Setup: `../docs/setup/` (Environment Setup, Security Guide)

---

**Built with ❤️ for Gauntlet AI**
