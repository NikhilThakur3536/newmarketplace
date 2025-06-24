"use client";

import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const checkExistingChat = useCallback(async (participantId) => {
    if (!participantId) return null;

    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/user/chat/list`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.data.success && response.data.data?.length > 0) {
        const existingChat = response.data.data.find(
          (chat) =>
            chat.participantId === participantId &&
            chat.participantType === "seller" &&
            chat.chatType === "direct"
        );
        return existingChat ? existingChat.id : null;
      }
      return null;
    } catch (err) {
      console.error("🔥 Check Existing Chat Error:", err.response?.data || err.message);
      return null;
    }
  }, []);

  const initiateChat = useCallback(
    async (participantId) => {
      if (!participantId) {
        setChatError("No participant ID provided");
        return false;
      }

      setIsChatLoading(true);
      setChatError(null);

      // Check for existing chat
      const existingChatId = await checkExistingChat(participantId);
      if (existingChatId) {
        setChatId(existingChatId);
        setMessages([]);
        setIsChatLoading(false);
        return existingChatId;
      }

      // Create new chat if none exists
      try {
        const token = getToken();
        const response = await axios.post(
          `${BASE_URL}/user/chat/create`,
          {
            participantId,
            participantType: "seller",
            chatType: "direct",
          },
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (response.data.success) {
          setChatId(response.data.data.id);
          setMessages([]);
          return response.data.data.id;
        } else {
          throw new Error("Failed to create chat session");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setChatError(`Failed to create chat: ${errorMessage}`);
        console.error("🔥 Chat Creation Error:", errorMessage);
        return false;
      } finally {
        setIsChatLoading(false);
      }
    },
    [checkExistingChat]
  );

  const fetchMessages = useCallback(async (chatId, participantId) => {
    if (!chatId || !participantId) return;

    setIsChatLoading(true);
    setChatError(null);

    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}/user/chat/${chatId}/messages`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.data.success) {
        setMessages(
          response.data.data.map((msg) => ({
            id: msg.id,
            text: msg.messageText,
            sender: msg.senderId === participantId ? "other" : "user",
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            attachments: msg.attachments || [],
          }))
        );
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setChatError(`Failed to fetch messages: ${errorMessage}`);
      console.error("🔥 Fetch Messages Error:", errorMessage);
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (chatId, messageText, attachments = []) => {
    if (!chatId || !messageText.trim()) return false;

    setIsSending(true);
    setChatError(null);

    const optimisticMsg = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const token = getToken();
      const response = await axios.post(
        `${BASE_URL}/user/chat/${chatId}/message`,
        { messageText, attachments },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMsg.id
              ? {
                  id: response.data.data.id,
                  text: response.data.data.messageText,
                  sender: "user",
                  timestamp: new Date(response.data.data.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  attachments: response.data.data.attachments || [],
                }
              : msg
          )
        );
        return true;
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setChatError(`Failed to send message: ${errorMessage}`);
      console.error("🔥 Send Message Error:", errorMessage);
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMsg.id));
      return false;
    } finally {
      setIsSending(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setChatId(null);
    setMessages([]);
    setChatError(null);
    setIsChatLoading(false);
    setIsSending(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chatId,
        messages,
        isSending,
        isChatLoading,
        chatError,
        initiateChat,
        fetchMessages,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};