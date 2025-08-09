import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.PROD ? undefined : 'https://3tx1f41g-8000.inc1.devtunnels.ms/';


export const socket = io(URL);