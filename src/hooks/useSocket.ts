"use client";

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useSocketContext } from "@/context/SocketContext";

/**
 * Hook optimizado de WebSocket.
 * Reutiliza una única conexión Socket.io global (Singleton) a través de SocketContext.
 * Se suscribe automáticamente a la sala de la organización activa del usuario.
 *
 * @param room Sala opcional personalizada para suscribirse adicionalmente
 */
export function useSocket(room?: string) {
  const { socket, connected, organizacionRoom, joinRoom, leaveRoom } =
    useSocketContext();

  useEffect(() => {
    if (!room || !connected) return;

    joinRoom(room);

    return () => {
      leaveRoom(room);
    };
  }, [room, connected, joinRoom, leaveRoom]);

  return {
    socket,
    connected,
    organizacionRoom,
    joinRoom,
    leaveRoom,
  };
}

/**
 * Hook helper para escuchar eventos de WebSocket con prevención de memory leaks
 * y ejecución con referencias actualizadas sin causar re-suscripciones innecesarias.
 */
export function useSocketEvent<T = any>(
  eventName: string,
  callback: (data: T) => void,
  socketInstance?: Socket | null
) {
  const { socket: contextSocket } = useSocketContext();
  const socket = socketInstance !== undefined ? socketInstance : contextSocket;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!socket || !eventName) return;

    const handler = (data: T) => {
      callbackRef.current?.(data);
    };

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName]);
}
