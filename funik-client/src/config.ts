const DEFAULT_SERVER_URL = import.meta.env.PROD ? 'https://funik.onrender.com' : 'http://localhost:8000';

export const SERVER_URL: string = import.meta.env.VITE_SERVER_URL || DEFAULT_SERVER_URL;
