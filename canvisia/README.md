# Canvisia

A real-time collaborative design tool inspired by Figma, with AI-assisted design capabilities.

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

### MVP (24 Hours)
- ✅ Basic canvas with pan/zoom (5000×5000px)
- ✅ Rectangle shape creation
- ✅ Drag and move objects
- ✅ Real-time sync between users
- ✅ Multiplayer cursors with name labels
- ✅ User presence awareness
- ✅ Google Sign-In authentication
- ✅ Deployed and publicly accessible

### Full Project (7 Days)
- Multiple shape types (Rectangle, Circle, Line, Text)
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

## Links

- Documentation: See `../docs/` directory for organized documentation
  - Planning: `../docs/planning/` (PRD, Architecture Diagrams)
  - Tasks: `../docs/tasks/` (Task Lists)
  - Testing: `../docs/testing/` (Test Documentation)
  - Setup: `../docs/setup/` (Environment Setup, Security Guide)
- Firebase Project: (will be added in PR #2)
- Live Demo: (will be added in PR #8)

---

**Built with ❤️ for Gauntlet AI**
