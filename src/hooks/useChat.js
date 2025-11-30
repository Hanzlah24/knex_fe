import { useState, useEffect, useCallback } from 'react';
import {
  initSocket,
  joinRoom,
  sendMessage,
  onReceiveMessage,
  offReceiveMessage,
  disconnectSocket,
} from '../services/chats/socket';

export function useChat({ myUserId, otherUserId }) {
  const [messages, setMessages] = useState([]);
  const room = [myUserId, otherUserId].sort().join('_');

  useEffect(() => {
    const socket = initSocket();
    setMessages([]);
    joinRoom(room);

    const handleMessage = msg => {
        console.log(messages)
      setMessages(prev => [...prev, msg]);
    };
    onReceiveMessage(handleMessage);

    return () => {
      offReceiveMessage(handleMessage);
      disconnectSocket();
    };
  }, [room]);

  const send = useCallback(
    content => {
      if (content.trim()) {
        sendMessage(room, content,otherUserId);
      }
    },
    [room]
  );

  return { messages, send };
}
