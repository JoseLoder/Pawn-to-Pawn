export const API_LOCAL = "https://pawn-to-pawn-express.vercel.app"


export const API = process.env.NODE_ENV === 'production' ?
    process.env.API_URL :
    API_LOCAL;
