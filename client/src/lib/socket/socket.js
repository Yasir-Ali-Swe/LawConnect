import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

/**
 * Creates and returns a new Socket.IO client instance.
 * @param {string} userId - The authenticated user's ID. Sent in the handshake
 *   query so the server can join this socket to a personal room for targeted delivery.
 * @returns {import("socket.io-client").Socket}
 */
export const createSocketConnection = (userId) => {
    if (!SOCKET_URL) {
        console.error(
            "[Socket] NEXT_PUBLIC_SOCKET_URL is not defined. " +
            "Add it to .env locally or to Vercel environment variables in production."
        );
    }

    return io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: false,      // Connected manually once the user is authenticated
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        // Force WebSocket — avoids long-polling which requires sticky sessions
        // (not available on Render's free tier)
        transports: ["websocket"],
        // Pass userId in the handshake so the server maps socket → personal room
        query: { userId: userId || "" },
    });
};
