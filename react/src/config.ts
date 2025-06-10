export const API_LOCAL = "http://localhost:3000"


export const API = process.env.NODE_ENV === 'production' ?
    process.env.API_URL :
    API_LOCAL;
