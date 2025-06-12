export const API_LOCAL = "https://pawn-to-pawn-express.vercel.app"


export const API = import.meta.env.NODE_ENV === 'production' ?
    import.meta.env.VITE_API_URL :
    API_LOCAL;
