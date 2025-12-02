# Discuzz.ai - AI-Powered Contextual Discussions

A Next.js application that enables deeper conversations through AI-powered context profiles. Share your thoughts with AI-generated context that helps others understand your intent, tone, and assumptions.

## Features

- **Context Profiles**: AI analyzes your posts to create detailed context profiles
- **AI Delegates**: Automated responses based on author's intent and perspective
- **Interactive Interviews**: Guided conversation to extract hidden context
- **Dark/Light Mode**: Full theme support with persistent preferences
- **Real-time Interactions**: Like, reply, and engage with AI-enhanced discussions

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19.2** - Latest React with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern styling
- **Google Gemini AI** - Context analysis and generation
- **Vercel Analytics** - Performance monitoring

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env.local` file with your API key:
   \`\`\`
   API_KEY=your_google_gemini_api_key
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
discuzz.ai/
├── app/
│   ├── api/              # API routes for AI services
│   ├── page.tsx          # Main application page
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles and theme tokens
├── components/           # React components
├── services/             # Service layer (AI integration)
├── types.ts              # TypeScript type definitions
├── constants.tsx         # Mock data and configuration
└── lib/                  # Utility functions
\`\`\`

## Environment Variables

- `API_KEY` - Google Gemini API key (required for AI features)
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Optional auth redirect URL

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## License

MIT License - Created with v0.dev
# Discuss-ai-frontend
