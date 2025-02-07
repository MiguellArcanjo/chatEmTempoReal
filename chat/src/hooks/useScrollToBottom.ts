// hooks/useScrollToBottom.ts
import { useEffect, useRef } from 'react';

export const useScrollToBottom = (dependency: any[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [dependency]);

  return { messagesEndRef };
};
