export const API_LOCAL = "https://pawn-to-pawn-express.vercel.app"


export const API = import.meta.env.PROD ?
    import.meta.env.VITE_API_URL :
    API_LOCAL;
