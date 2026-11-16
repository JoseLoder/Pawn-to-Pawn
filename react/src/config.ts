export const API_LOCAL = "https://pawn-to-pawn-express.vercel.app"

// VITE_API_URL is read at build time (npm run build) and when the dev server
// starts (npm run dev). Set it in Vercel for production and in
// docker-compose.dev.yml for local development. Without it, the app falls back
// to the deployed backend.
export const API = import.meta.env.VITE_API_URL || API_LOCAL;
