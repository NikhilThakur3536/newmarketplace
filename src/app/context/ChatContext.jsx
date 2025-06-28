"use client";

import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chatId, setChatId] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [chatProductId, setChatProductId] = useState(null); // New state for chatProductId
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const checkExistingChat = useCallback(async (participantId, productId) => {
    if (!productId) {
      console.warn("Missing productId:", { productId });
      setChatError("Missing product ID");
      return { chatId: null, chatProductId: null };
    }

    try {
      const token = getToken();
      if (!token) {
        console.warn("No authentication token found");
        setChatError("Authentication token missing");
        return { chatId: null, chatProductId: null };
      }

      const response = await axios.get(`${BASE_URL}/user/chat/list`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("Check Existing Chat Response:", JSON.stringify(response.data, null, 2));

      if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const existingChat = response.data.data.find(
          (chat) =>
            chat.participantType === "seller" &&
            chat.chatType === "direct" &&
            chat.productId === productId &&
            chat.participantId === participantId
        );

        if (existingChat) {
          const chatProductId = existingChat.chatProducts?.[0]?.id || null;
          // console.log("Found existing chat with ID:", existingChat.id, "and chatProductId:", chatProductId, "for productId:", productId);
          return { chatId: existingChat.id, chatProductId };
        } else {
          // console.log("No matching chat found for productId:", productId);
          setChatError("No matching chat found for this product");
          return { chatId: null, chatProductId: null };
        }
      } else {
        // console.log("No chats found or API call unsuccessful:", response.data);
        setChatError("No existing chats found");
        return { chatId: null, chatProductId: null };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error("Check Existing Chat Error:", errorMessage, err.response?.data);
      setChatError(`Failed to check existing chats: ${errorMessage}`);
      return { chatId: null, chatProductId: null };
    }
  }, []);

  const fetchMessages = useCallback(
    async (chatId) => {
      if (!chatId) {
        console.warn("No chatId provided for fetchMessages");
        setChatError("No chat ID provided");
        return;
      }

      setIsChatLoading(true);
      setChatError(null);
      setMessages([]);

      try {
        const token = getToken();
        if (!token) {
          throw new Error("Authentication token missing");
        }

        const response = await axios.post(
          `${BASE_URL}/user/chat/messages/get`,
          {
            chatId,
            languageId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // console.log("Fetch Messages API Response:", JSON.stringify(response.data, null, 2));

        if (response.data.success) {
          const messagesData = Array.isArray(response.data.data)
            ? response.data.data
            : response.data.data?.messages || response.data.data?.results || [];

          // console.log("Parsed messagesData:", messagesData);

          if (messagesData.length === 0) {
            // console.log("No messages found for chatId:", chatId);
            setMessages([]);
          } else {
            setMessages(
              messagesData.map((msg, index) => {
                const mappedMsg = {
                  id: msg.id || `temp-${index}`,
                  text: msg.messageText || "",
                  sender: msg.senderId === participantId ? "other" : "user",
                  timestamp: msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  attachments: msg.attachments || [],
                  proposedPrice: msg.proposedPrice || null,
                };
                // console.log("Mapped message:", mappedMsg);
                return mappedMsg;
              })
            );
          }
        } else {
          throw new Error("Failed to fetch messages: API success is false");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setChatError(`Failed to fetch messages: ${errorMessage}`);
        console.error("Fetch Messages Error:", errorMessage, err.response?.data);
      } finally {
        setIsChatLoading(false);
      }
    },
    [participantId]
  );

  const initiateChat = useCallback(
  async (participantId, productId, varientId, inventoryId) => {
    if (!participantId || !productId) {
      setChatError("No participant ID or product ID provided");
      console.warn("Missing participantId or productId:", { participantId, productId });
      return false;
    }

    setIsChatLoading(true);
    setChatError(null);
    setMessages([]);

    try {
      const { chatId: existingChatId, chatProductId: existingChatProductId } = await checkExistingChat(participantId, productId);
      if (existingChatId) {
        // console.log("Using existing chatId:", existingChatId, "and chatProductId:", existingChatProductId);
        setChatId(existingChatId);
        setParticipantId(participantId);
        setChatProductId(existingChatProductId);
        await fetchMessages(existingChatId);
        return existingChatId;
      }

      // console.log("Creating new chat for participantId:", participantId, "and productId:", productId);
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const response = await axios.post(
        `${BASE_URL}/user/chat/create`,
        {
          participantId,
          participantType: "seller",
          chatType: "direct",
          productId,
          varientId,
          inventoryId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const newChatId = response.data.data.id;
        const newChatProductId = response.data.data.chatProducts?.[0]?.id || null;
        // console.log("Created new chat with ID:", newChatId, "and chatProductId:", newChatProductId);
        setChatId(newChatId);
        setParticipantId(participantId);
        setChatProductId(newChatProductId);
        await fetchMessages(newChatId);
        return newChatId;
      } else {
        throw new Error("Failed to create chat session");
      }
    } catch (err) {
      if (err.response?.data?.error === "Chat already exists" && err.response?.data?.existingChatId) {
        const existingChatId = err.response.data.existingChatId;
        // console.log("Chat already exists, using existingChatId:", existingChatId);
        setChatId(existingChatId);
        setParticipantId(participantId);
        // Fetch chat details to get chatProductId
        const token = getToken(); // Define token here
        if (!token) {
          setChatError("Authentication token missing for fetching existing chat details");
          console.error("No token available for fetching existing chat details");
          return false;
        }
        const chatResponse = await axios.get(`${BASE_URL}/user/chat/list`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const existingChat = chatResponse.data.data.find((chat) => chat.id === existingChatId);
        const existingChatProductId = existingChat?.chatProducts?.[0]?.id || null;
        setChatProductId(existingChatProductId);
        await fetchMessages(existingChatId);
        return existingChatId;
      }

      const errorMessage = err.response?.data?.message || err.message;
      setChatError(`Failed to create chat: ${errorMessage}`);
      console.error("Chat Creation Error:", errorMessage, err.response?.data);
      return false;
    } finally {
      setIsChatLoading(false);
    }
  },
  [checkExistingChat, fetchMessages]
);
  const sendMessage = useCallback(
    async (chatId, messageText, proposedPrice = null) => {
      if (!chatId || !messageText.trim()) {
        console.warn("Invalid chatId or empty message:", { chatId, messageText });
        setChatError("Invalid chat ID or empty message");
        return false;
      }

      if (proposedPrice !== null && proposedPrice !== undefined && !chatProductId) {
        console.warn("No chatProductId available for proposedPrice");
        setChatError("Cannot send proposed price without a valid chat product ID");
        return false;
      }

      setIsSending(true);
      setChatError(null);

      const optimisticMsg = {
        id: Date.now().toString(),
        text: messageText,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        attachments: [],
        proposedPrice: proposedPrice || null,
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const token = getToken();
        if (!token) {
          throw new Error("Authentication token missing");
        }

        const payload = {
          messageText,
        };
        if (proposedPrice !== null && proposedPrice !== undefined) {
          payload.proposedPrice = parseFloat(proposedPrice);
          payload.chatProductId = chatProductId; // Include chatProductId when proposedPrice is provided
        }

        const response = await axios.post(
          `${BASE_URL}/user/chat/${chatId}/message`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
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
                    proposedPrice: response.data.data.proposedPrice || null,
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
        console.error("Send Message Error:", errorMessage, err.response?.data);
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMsg.id));
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [chatProductId]
  );

  const deleteMessage = useCallback(async (messageId) => {
    if (!messageId) {
      console.warn("No messageId provided for deleteMessage");
      setChatError("No message ID provided");
      return false;
    }

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token missing");
      }

      await axios.delete(`${BASE_URL}/user/chat/messages/${messageId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setChatError(`Failed to delete message: ${errorMessage}`);
      console.error("Delete Message Error:", errorMessage, err.response?.data);
      return false;
    }
  }, []);

  const clearChat = useCallback(() => {
    console.log("Clearing chat state");
    setChatId(null);
    setParticipantId(null);
    setChatProductId(null);
    setMessages([]);
    setChatError(null);
    setIsChatLoading(false);
    setIsSending(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chatId,
        participantId,
        chatProductId,
        messages,
        isSending,
        isChatLoading,
        chatError,
        initiateChat,
        fetchMessages,
        sendMessage,
        deleteMessage,
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