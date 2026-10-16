"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { getOrganizacionId, getUsuarioActual } from "@/services/auth";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  organizacionRoom: string | null;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  organizacionRoom: null,
  joinRoom: () => {},
  leaveRoom: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [organizacionRoom, setOrganizacionRoom] = useState<string | null>(null);

  // Registro de salas activas para re-unirse tras reconexión
  const activeRoomsRef = useRef<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);

  // Detectar y actualizar sala de la organización activa
  const refreshOrgRoom = useCallback(() => {
    if (typeof window === "undefined") return;
    const user = getUsuarioActual();
    const orgId = getOrganizacionId() || user?.organizacionId;

    if (orgId) {
      const roomName = `org_${orgId}`;
      setOrganizacionRoom(roomName);
      activeRoomsRef.current.add(roomName);

      if (socketRef.current?.connected) {
        socketRef.current.emit("join:room", { room: roomName });
      }
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    if (!room) return;
    activeRoomsRef.current.add(room);
    if (socketRef.current?.connected) {
      socketRef.current.emit("join:room", { room });
    }
  }, []);

  const leaveRoom = useCallback((room: string) => {
    if (!room) return;
    activeRoomsRef.current.delete(room);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inicializar conexión Socket.io única (Singleton global en la sesión)
    const socketIo = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketRef.current = socketIo;
    setSocket(socketIo);

    socketIo.on("connect", () => {
      setConnected(true);
      // Unirse a la sala de la organización activa
      const user = getUsuarioActual();
      const orgId = getOrganizacionId() || user?.organizacionId;
      if (orgId) {
        const orgRoom = `org_${orgId}`;
        setOrganizacionRoom(orgRoom);
        activeRoomsRef.current.add(orgRoom);
      }

      // Re-unirse a todas las salas registradas tras reconexión
      activeRoomsRef.current.forEach((room) => {
        socketIo.emit("join:room", { room });
      });
    });

    socketIo.on("disconnect", () => {
      setConnected(false);
    });

    socketIo.on("reconnect", () => {
      setConnected(true);
      activeRoomsRef.current.forEach((room) => {
        socketIo.emit("join:room", { room });
      });
    });

    // Detectar eventos de storage por si cambia de organización o hace login
    const handleStorageChange = () => {
      refreshOrgRoom();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      socketIo.disconnect();
      socketRef.current = null;
    };
  }, [refreshOrgRoom]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        organizacionRoom,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
