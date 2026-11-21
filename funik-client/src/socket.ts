import { io } from 'socket.io-client';
import { SERVER_URL } from './config';
import { getToken } from './lib/api';

// `auth` is a callback so every (re)connect sends the current login token.
export const socket = io(SERVER_URL, {
  auth: (cb) => cb({ token: getToken() }),
});

/** Reconnects so the server sees a login / logout. Game components re-join their room on "connect". */
export const reconnectSocket = () => {
  socket.disconnect();
  socket.connect();
};
