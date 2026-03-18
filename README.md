# SoloCoder

AI-powered solo developer IDE with integrated code editor, terminal, Markdown preview, and project management.

## Features

- **AI Code Editor** -- Monaco-based editor with AI-assisted code completion
- **Integrated Terminal** -- Xterm.js terminal with fit and web links addons
- **Project Management** -- Create, organize, and switch between coding projects
- **Markdown Preview** -- Live preview for documentation with syntax highlighting
- **AI Chat Assistant** -- Conversational AI for code generation and debugging
- **Landing Page** -- Onboarding experience for new users

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Code Editor:** Monaco Editor (@monaco-editor/react)
- **Terminal:** Xterm.js with addons
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Database:** Supabase (with SSR support)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd solocoder
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
solocoder/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   └── project/[id]/ # Project workspace
│   ├── components/       # React components
│   │   ├── ide/          # IDE layout and panels
│   │   └── shared/       # Landing page, common UI
│   ├── store/            # Zustand state management
│   └── lib/              # Utilities and helpers
├── public/               # Static assets
└── package.json
```

## License

MIT
