import { useEffect, useState } from 'react';
import { socket } from '@/socket';

/** Tracks whether the shared Socket.IO connection is currently up. */
export const useSocketConnected = (): boolean => {
    const [connected, setConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        // The socket may have connected between the first render and this subscription.
        setConnected(socket.connected);
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return connected;
};
