# QPilot

AI-driven questionnaire builder, built with Next.js 15 and deployed on Cloudflare Workers.

## Tech Stack

- **Framework**: Next.js 15, React 19
- **Styling**: Tailwind CSS v4, Radix UI, Framer Motion
- **Deployment**: Cloudflare Workers (via OpenNext)
- **AI Integration**: Support for advanced LLMs (e.g., LLaMA 3.3)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Environment Variables

To run this project locally, you need to configure the following environment variables in a `.env.local` file (check `.env.example` if available, or ask your team for the keys):

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_API_KEY`
- `NEXT_PUBLIC_SUGGESTIONS`
- `NEXT_PUBLIC_MODELS`

## Deployment

This project uses GitHub Actions for CI/CD and is configured to deploy automatically to Cloudflare Workers via OpenNext. Deployments trigger automatically on pushes to the `main` branch.
