import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.PROD ? 'https://funik.onrender.com/' : 'http://localhost:8000';


export const socket = io(URL);