import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function useSocket(room?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    const socketIo = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketIo.on("connect", () => {
      setConnected(true);
      if (room) {
        socketIo.emit("join:room", { room });
      }
    });

    socketIo.on("disconnect", () => {
      setConnected(false);
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [room]);

  return { socket, connected };
}
