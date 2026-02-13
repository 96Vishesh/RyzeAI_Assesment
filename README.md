# RyzeAI UI Generator

An AI-powered agent that converts natural language UI descriptions into working UI code with live preview, using a **fixed, deterministic component library**.

> Think: Claude Code for UI — but safe, reproducible, and debuggable.

---

## 🎯 Features

- **Natural Language → UI**: Describe any UI in plain English and see it built instantly
- **Deterministic Component System**: All UIs use the same 8 fixed components — identical rendering every time
- **Multi-Step AI Agent**: Planner → Generator → Explainer pipeline (not a single LLM call)
- **Incremental Edits**: Modify existing UIs without full rewrites
- **Version History & Rollback**: Track every change and restore any previous version
- **Live Preview**: Sandboxed iframe rendering with real-time updates
- **Safety & Validation**: Component whitelist enforcement, prompt injection protection, code validation

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Chat Panel  │  │  Code Panel  │  │   Live Preview (iframe) │ │
│  │  - Messages  │  │  - Syntax    │  │   - Sandboxed Babel     │ │
│  │  - Input     │  │    highlight │  │   - Fixed CSS injected  │ │
│  │  - Explain   │  │  - Editable  │  │   - Component defs      │ │
│  └──────┬───────┘  └──────────────┘  └─────────────────────────┘ │
│         │               ▲                        ▲               │
│         │               │ code                   │ code          │
│         ▼               │                        │               │
│  ┌──────────────────────┴────────────────────────┘               │
│  │                State Management (App.tsx)                     │
│  │  - Session ID, Messages, Code, Versions                      │
│  └──────┬──────────────────────────────────────────────────┐     │
│         │  API calls                                        │     │
└─────────┼──────────────────────────────────────────────────┼─────┘
          ▼                                                  │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express + TypeScript)            │
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ 1.Planner │──▶│ 2.Generator  │──▶│ 3.Explainer  │       │
│  │ (intent→  │   │ (plan→code)  │   │ (decisions→  │       │
│  │  plan)    │   │              │   │  English)    │       │
│  └──────────┘    └──────────────┘    └──────────────┘       │
│       │                │                    │               │
│       ▼                ▼                    ▼               │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ Sanitizer│    │  Validator   │    │Version Store │       │
│  │ (prompt  │    │  (whitelist  │    │ (in-memory   │       │
│  │  safety) │    │   enforce)   │    │  history)    │       │
│  └──────────┘    └──────────────┘    └──────────────┘       │
│                                                             │
│  LLM: Google Gemini 2.0 Flash                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 Agent Design & Prompts

The AI agent uses a **3-step pipeline** (not a single LLM call):

### Step 1: Planner (`server/src/agent/planner.ts`)
- **Input**: User's natural language description
- **Output**: Structured JSON plan with layout type, component list, and props
- **Prompt**: Interprets intent, selects from 8 fixed components, defines layout structure

### Step 2: Generator (`server/src/agent/generator.ts`)
- **Input**: Structured plan from the Planner
- **Output**: Valid React component code using only whitelisted components
- **Prompt**: Converts plan to JSX, enforces `import from './components/ui'`, no inline styles

### Step 3: Explainer (`server/src/agent/explainer.ts`)
- **Input**: User request + plan + generated code
- **Output**: Plain English explanation (3-5 bullet points)
- **Purpose**: Helps users understand *why* the AI made each decision

### Modifier (for incremental edits)
- **Input**: Current code + modification request
- **Output**: Modified code (preserving existing structure)
- **Key rule**: Modifies, doesn't rewrite — preserves unchanged components

All prompt templates are in `server/src/agent/prompts.ts`.

---

## 🧱 Component System Design

### Fixed Components (8 total)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button` | Actions | `variant`, `size`, `disabled` |
| `Card` | Content container | `title`, `subtitle`, `footer` |
| `Input` | Text entry | `label`, `type`, `multiline` |
| `Table` | Data display | `columns`, `data` |
| `Modal` | Overlay dialog | `title`, `isOpen`, `onClose` |
| `Sidebar` | Vertical navigation | `brand`, `items`, `activeItem` |
| `Navbar` | Horizontal navigation | `brand`, `links`, `actions` |
| `Chart` | Bar visualization | `data`, `title` |

### Rules enforced:
- ❌ No inline styles
- ❌ No AI-generated CSS
- ❌ No new components
- ❌ No external UI libraries
- ✅ Only whitelisted CSS utility classes
- ✅ Fixed, immutable `components.css`

### Validation (server/src/validation/)
- **Code Validator**: Scans JSX for non-whitelisted components, inline styles, and invalid imports
- **Prompt Sanitizer**: Detects injection patterns, limits input length, strips HTML/scripts

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- Google AI API Key (Gemini)

### Installation

```bash
# Clone the repository
git clone https://github.com/96Vishesh/RyzeAI_Assesment.git
cd RyzeAI_Assesment

# Install all dependencies
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env and add your GOOGLE_AI_API_KEY
```

### Running

```bash
# Start both frontend and backend
npm run dev

# Or run separately:
npm run dev:server    # Express API on http://localhost:3001
npm run dev:client    # Vite dev server on http://localhost:5173
```

### Usage
1. Open `http://localhost:5173`
2. Type a UI description (e.g., "Create a dashboard with a navbar, two cards, and a table")
3. See the AI generate code + live preview
4. Send follow-up messages to modify the UI iteratively
5. Use version history to rollback to any previous version

---

## 📁 Project Structure

```
RyzeAI_Assesment/
├── client/                         # React + Vite frontend
│   └── src/
│       ├── components/ui/          # Fixed component library
│       │   ├── Button.tsx
│       │   ├── Card.tsx
│       │   ├── Input.tsx
│       │   ├── Table.tsx
│       │   ├── Modal.tsx
│       │   ├── Sidebar.tsx
│       │   ├── Navbar.tsx
│       │   ├── Chart.tsx
│       │   ├── components.css      # Fixed styles (immutable)
│       │   ├── componentRegistry.ts
│       │   └── index.ts
│       ├── panels/                 # Claude-style UI panels
│       │   ├── ChatPanel.tsx       # Left: AI chat
│       │   ├── CodePanel.tsx       # Center: Code editor
│       │   ├── PreviewPanel.tsx    # Right: Live preview
│       │   └── VersionSidebar.tsx  # Version history
│       ├── api.ts                  # API client
│       ├── App.tsx                 # Main 3-panel layout
│       └── App.css                 # Dark theme styles
├── server/                         # Express + TypeScript backend
│   └── src/
│       ├── agent/
│       │   ├── prompts.ts          # All prompt templates
│       │   ├── planner.ts          # Step 1: Intent → Plan
│       │   ├── generator.ts        # Step 2: Plan → Code
│       │   └── explainer.ts        # Step 3: Decisions → English
│       ├── validation/
│       │   ├── codeValidator.ts    # Component whitelist enforcement
│       │   └── sanitizer.ts        # Prompt injection protection
│       ├── storage/
│       │   └── versionStore.ts     # In-memory version history
│       ├── routes/
│       │   └── agent.ts            # API endpoints
│       └── index.ts                # Express server entry
└── package.json                    # Root monorepo config
```

---

## ⚠️ Known Limitations

1. **In-memory storage**: Version history is lost on server restart (no persistent DB)
2. **Single session**: No multi-user session management
3. **Chart component**: Uses minimal inline styles for dynamic bar heights (data-driven necessity)
4. **Preview iframe**: Uses Babel standalone for JSX transformation (heavier than ideal)
5. **No streaming**: AI responses arrive all at once (no token streaming)
6. **No diff view**: Changes aren't visually diffed between versions
7. **LLM consistency**: Gemini may occasionally produce slightly different code for the same prompt

---

## 🔮 What I'd Improve With More Time

1. **Persistent storage**: Add SQLite/PostgreSQL for session and version persistence
2. **Streaming responses**: Stream AI responses token-by-token for better UX
3. **Diff view**: Visual side-by-side diff between code versions
4. **Component schema validation**: Validate generated props against the registry schema at the type level
5. **Static analysis**: AST-level validation using Babel parser instead of regex
6. **Replayable generations**: Store seed/temperature to make LLM outputs reproducible
7. **Code editor**: Replace textarea with Monaco editor for proper IDE experience
8. **Multi-model support**: Support OpenAI, Anthropic, and local models
9. **Export**: Allow exporting generated UIs as standalone React projects
10. **Test suite**: Add unit and integration tests for agent pipeline

---

## 🧰 Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Express + TypeScript |
| AI | Google Gemini 2.0 Flash |
| Styling | Vanilla CSS (fixed, no AI-generated) |
| Storage | In-memory (Map-based) |
| Preview | Sandboxed iframe + Babel standalone |
