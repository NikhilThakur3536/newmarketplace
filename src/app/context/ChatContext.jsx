"use client";

import { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chatId, setChatId] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [chatProductId, setChatProductId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [productName, setProductName] = useState(null);
  const [productDescription, setProductDescription] = useState(null);
  const [chatListCache, setChatListCache] = useState(null); // Cache for chat list

  const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const checkExistingChat = useCallback(async (participantId, productId = null) => {
    // console.log("Checking existing chat for participantId:", participantId, "productId:", productId, "at:", new Date().toISOString());

    try {
      const token = getToken();
      if (!token) {
        console.warn("No authentication token found");
        setChatError("Authentication token missing");
        return { chatId: null, chatProductId: null };
      }

      // Use cached chat list if available
      let chats = chatListCache;
      if (!chats) {
        const response = await axios.get(`${BASE_URL}/user/chat/list`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          chats = response.data.data;
          setChatListCache(chats); // Cache the chat list
        } else {
          setChatError("No existing chats found");
          return { chatId: null, chatProductId: null };
        }
      }

      const existingChat = chats.find(
        (chat) =>
          chat.participantType === "seller" &&
          chat.chatType === "direct" &&
          chat.participantId === participantId &&
          (!productId || chat.productId === productId) // Match productId only if provided
      );

      if (existingChat) {
        const chatProductId = existingChat.chatProducts?.[0]?.id || null;
        return { chatId: existingChat.id, chatProductId };
      }
      return { chatId: null, chatProductId: null };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      console.error("Check Existing Chat Error:", errorMessage, err.response?.data);
      setChatError(`Failed to check existing chats: ${errorMessage}`);
      return { chatId: null, chatProductId: null };
    }
  }, [chatListCache]);

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
      setProductName(null);
      setProductDescription(null);

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

        // console.log("messages",response)

        if (response.data.success) {
          const messagesData = Array.isArray(response.data.data?.messages)
            ? response.data.data.messages
            : response.data.data?.results || [];

          if (messagesData.length === 0) {
            setMessages([]);
          } else {
            setMessages(
              messagesData.map((msg, index) => ({
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
                isPriceApproved:msg.priceNegotiation?.isPriceApproved
              }))
            );
          }

          if (response.data.data?.activeNegotiation) {
            setProductName(response.data.data.activeNegotiation.product?.name || "Unnamed Product");
            setProductDescription(
              response.data.data.activeNegotiation.variant?.name || "No description"
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
    async (participantId, productId = null, varientId = null, inventoryId = null) => {
      if (!participantId) {
        setChatError("No participant ID provided");
        console.warn("Missing participantId:", { participantId });
        return false;
      }

      if (isChatLoading) {
        console.warn("Chat initiation in progress, skipping...");
        return false;
      }

      setIsChatLoading(true);
      setChatError(null);
      setMessages([]);

      try {
        // Check for existing chat
        const { chatId: existingChatId, chatProductId: existingChatProductId } = await checkExistingChat(
          participantId,
          productId
        );

        // If an existing chat is found, open it
        if (existingChatId) {
          // console.log("Opening existing chat with ID:", existingChatId);
          setChatId(existingChatId);
          setParticipantId(participantId);
          setChatProductId(existingChatProductId);
          await fetchMessages(existingChatId);
          return existingChatId;
        }

        const token = getToken();
        if (!token) {
          throw new Error("Authentication token missing");
        }

        // Construct payload dynamically, only include fields if explicitly provided and not null
        const payload = {
          participantId,
          participantType: "seller",
          chatType: "direct",
        };
        if (productId) payload.productId = productId;
        if (varientId) payload.varientId = varientId;
        if (inventoryId) payload.inventoryId = inventoryId;

        // console.log("Initiated chat payload:", payload);

        const response = await axios.post(
          `${BASE_URL}/user/chat/create`,
          payload,
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
          setChatId(newChatId);
          setParticipantId(participantId);
          setChatProductId(newChatProductId);
          await fetchMessages(newChatId);
          setChatListCache(null); // Invalidate cache when a new chat is created
          return newChatId;
        } else {
          throw new Error("Failed to create chat session");
        }
      } catch (err) {
        if (err.response?.data?.error === "Chat already exists") {
          const existingChatId = err.response.data.existingChatId;
          // console.log("Chat already exists, opening chat with ID:", existingChatId);
          setChatId(existingChatId);
          setParticipantId(participantId);
          const token = getToken();
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
          setChatListCache(chatResponse.data.data); // Update cache
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
    [checkExistingChat, fetchMessages, isChatLoading]
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
          payload.chatProductId = chatProductId;
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
          setChatListCache(null); // Invalidate cache when a new message is sent
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

  const fetchChats = useCallback(async () => {
    // console.log("Fetching chats at:", new Date().toISOString());
    setIsChatLoading(true);
    setChatError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication token missing");
      }

      if (chatListCache) {
        setIsChatLoading(false);
        return chatListCache.map((chat) => ({
          id: chat.id,
          participantId: chat.participantId,
          participantType: chat.participantType,
          chatType: chat.chatType,
          productId: chat.chatProducts?.[0]?.product?.id || null,
          chatProductId: chat.chatProducts?.[0]?.id || null,
          varientId: chat.chatProducts?.[0]?.varientId || null,
          inventoryId: chat.chatProducts?.[0]?.inventoryId || null,
          productSeller: chat.store?.name,
          productName: chat.chatProducts?.[0]?.product?.productLanguages?.[0]?.name || null,
        }));
      }

      const response = await axios.get(`${BASE_URL}/user/chat/list`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log("API response fetch chats:", response);

      if (response.data.success && Array.isArray(response.data.data)) {
        setChatListCache(response.data.data);
        return response.data.data.map((chat) => ({
          id: chat.id,
          participantId: chat.participantId,
          participantType: chat.participantType,
          chatType: chat.chatType,
          productId: chat.chatProducts?.[0]?.product?.id || null,
          chatProductId: chat.chatProducts?.[0]?.id || null,
          varientId: chat.chatProducts?.[0]?.varientId || null,
          inventoryId: chat.chatProducts?.[0]?.inventoryId || null,
          productSeller: chat.store?.name,
          productName: chat.chatProducts?.[0]?.product?.productLanguages?.[0]?.name || null,
        }));
      } else {
        throw new Error("No chats found or API call unsuccessful");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setChatError(`Failed to fetch chats: ${errorMessage}`);
      console.error("Fetch Chats Error:", errorMessage, err.response?.data);
      return [];
    } finally {
      setIsChatLoading(false);
    }
  }, [chatListCache]);

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
      setChatListCache(null); // Invalidate cache when a message is deleted
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setChatError(`Failed to delete message: ${errorMessage}`);
      console.error("Delete Message Error:", errorMessage, err.response?.data);
      return false;
    }
  }, []);

  const clearChat = useCallback(() => {
    setChatId(null);
    setParticipantId(null);
    setChatProductId(null);
    setMessages([]);
    setChatError(null);
    setIsChatLoading(false);
    setIsSending(false);
    setProductName(null);
    setProductDescription(null);
    setChatListCache(null); // Clear cache when resetting chat
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
        fetchChats,
        productName,
        productDescription,
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