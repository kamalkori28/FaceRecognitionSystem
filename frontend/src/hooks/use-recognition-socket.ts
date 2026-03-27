import { useCallback, useEffect, useRef, useState } from "react";

import { wsUrl } from "@/lib/api";
import type { RecognitionResult } from "@/lib/types";

export function useRecognitionSocket(token: string | null) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
    setIsConnected(false);
    setIsActive(false);
  }, []);

  const start = useCallback(() => {
    if (!token || socketRef.current) {
      return;
    }

    const socket = new WebSocket(wsUrl("/ws/recognition", token));
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      setIsActive(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as {
        event: string;
        data: RecognitionResult | { message: string };
      };

      if (message.event === "recognition:result") {
        setResult(message.data as RecognitionResult);
      }

      if (message.event === "recognition:error") {
        setError((message.data as { message: string }).message);
      }
    };

    socket.onerror = () => {
      setError("Recognition socket failed to connect");
    };

    socket.onclose = () => {
      socketRef.current = null;
      setIsConnected(false);
      setIsActive(false);
    };
  }, [token]);

  const sendFrame = useCallback((image: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: "frame",
        image,
      }),
    );
  }, []);

  useEffect(() => stop, [stop]);

  return {
    isConnected,
    isActive,
    result,
    error,
    start,
    stop,
    sendFrame,
  };
}

