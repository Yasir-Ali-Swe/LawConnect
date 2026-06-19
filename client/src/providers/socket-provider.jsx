"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { createSocketConnection } from "@/lib/socket/socket";
import { SOCKET_EVENTS } from "@/lib/socket/socket-events";

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  joinConversation: () => {},
  leaveConversation: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);
  const userId = user?._id || user?.id;
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Only connect if authenticated and user has an allowed role
    const shouldConnect =
      isAuthenticated && userId && (role === "lawyer" || role === "client");

    if (shouldConnect) {
      if (!socketRef.current) {
        // Pass userId so the server can join this socket to a personal room
        socketRef.current = createSocketConnection(userId);
        setSocket(socketRef.current);

        const socket = socketRef.current;

        socket.on(SOCKET_EVENTS.CONNECT, () => {
          setIsConnected(true);
        });

        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
          setIsConnected(false);
        });

        socket.on(SOCKET_EVENTS.CONNECT_ERROR, (err) => {
          console.error("Socket connection error:", err);
        });
      }

      const socket = socketRef.current;
      if (!socket.connected) {
        socket.connect();
      }
    } else {
      // Disconnect if conditions are not met (logout, role change, etc.)
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [isAuthenticated, role, userId]);

  // Helpers for joining/leaving conversation rooms — called by message pages
  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit(SOCKET_EVENTS.CONVERSATION_JOIN, conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit(SOCKET_EVENTS.CONVERSATION_LEAVE, conversationId);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinConversation, leaveConversation }}>
      {children}
    </SocketContext.Provider>
  );
};
