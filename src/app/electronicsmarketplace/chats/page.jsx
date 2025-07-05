"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, Smile, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChat } from "@/app/context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Breadcrumbs from "@/app/components/electronicsmarketplcae/BreadCrumbs";

export default function Chats() {
  const router = useRouter();
  const {
    chatId,
    messages,
    isSending,
    isChatLoading,
    chatError,
    initiateChat,
    fetchMessages,
    sendMessage,
    deleteMessage,
    fetchChats,
    chatProductId,
    productName,
    productDescription,
  } = useChat();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showPropose, setShowPropose] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadChats = async () => {
      const fetchedChats = await fetchChats();
      console.log("Fetched chats:", fetchedChats);

      // Fetch the last message for each chat
      const enhancedChats = await Promise.all(
        fetchedChats.map(async (chat) => {
          let lastMessage = "No messages yet";
          try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (!token) {
              throw new Error("Authentication token missing");
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user/chat/messages/get`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                chatId: chat.id,
                languageId: "2bfa9d89-61c4-401e-aae3-346627460558",
              }),
            });

            const data = await response.json();
            if (data.success && Array.isArray(data.data?.messages) && data.data.messages.length > 0) {
              const latestMessage = data.data.messages[data.data.messages.length - 1];
              lastMessage = latestMessage.messageText || "No message text";
            }
          } catch (err) {
            console.error(`Failed to fetch messages for chat ${chat.id}:`, err);
          }

          return {
            ...chat,
            participantName: chat.productSeller || `User ${chat.id.slice(-4)}`,
            unreadCount: Math.floor(Math.random() * 3),
            productName: chat.product?.productLanguages?.[0]?.name || "Unnamed Product",
            productDescription: chat.product?.productLanguages?.[0]?.shortDescription || "No description",
            productImage: "/placeholder.jpg",
            productSeller: chat.productSeller || "unknown seller",
            productName:chat.productName,
            varientId: chat.varientId || null,
            inventoryId: chat.inventoryId || null,
            lastMessage, // Add the last message to the chat object
          };
        })
      );

      console.log("Enhanced chats:", JSON.stringify(enhancedChats, null, 2));
      setChats(enhancedChats);
    };
    loadChats();
  }, [fetchChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatId && selectedChat) {
      fetchMessages(chatId);
      // Update the last message in the chats state when messages are updated
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId && messages.length > 0
            ? { ...chat, lastMessage: messages[messages.length - 1].text }
            : chat
        )
      );
    }
  }, [chatId, fetchMessages, selectedChat,]);

  const handleChatClick = async (chat) => {
    try {
      console.log("Chat clicked with varientId:", chat.varientId);
      const initiatedChatId = await initiateChat(
        chat.participantId,
        chat.productId,
        chat.varientId,
        chat.inventoryId
      );
      if (initiatedChatId) {
        setSelectedChat(chat);
        console.log("Selected chat with varientId:", chat.varientId);
      }
    } catch (err) {
      console.error("Failed to initiate chat:", err);
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setNewMessage("");
    setProposedPrice("");
    setShowOffer(false);
    setShowPropose(false);
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if ((newMessage.trim() || proposedPrice) && !isSending && chatId && selectedChat?.productId) {
      const messageText = proposedPrice ? `${newMessage.trim()}` : newMessage.trim();
      const success = await sendMessage(chatId, messageText, proposedPrice || null);
      if (success) {
        setNewMessage("");
        setProposedPrice("");
        setShowPropose(false);
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }, 1000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (messageId) {
      deleteMessage(messageId);
      // Update the last message after deletion
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId && messages.length > 1
            ? { ...chat, lastMessage: messages[messages.length - 2].text }
            : chat
        )
      );
    }
  };

  const handlePriceClick = () => {
    setShowOffer(true);
    setShowPropose(true);
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <div className="flex flex-col gap-4 max-w-md w-full">
        <Breadcrumbs/>
        {/* Header */}
        <div className="w-full px-4 flex gap-4 py-3 items-center bg-white shadow-md sticky top-0 z-50">
          <ChevronLeft
            size={20}
            strokeWidth={3}
            className="cursor-pointer text-gray-600"
            onClick={() => router.push("/electronicsmarketplace")}
          />
          <span className="font-bold text-xl text-gray-800">Chats</span>
        </div>

        {/* Chat List */}
        <div className="flex flex-col gap-2 px-4">
          {isChatLoading && <p className="text-gray-600">Loading chats...</p>}
          {chatError && <p className="text-red-500">{chatError}</p>}
          {!isChatLoading && chats.length === 0 && !chatError && (
            <p className="text-gray-500">No chats available.</p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handleChatClick(chat)}
            >
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold relative">
                <Image src={"/placeholder.jpg"} alt="img" fill  className="object-cover rounded-full"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800 truncate">
                    {chat.productName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {/* {chat.unreadCount > 0 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-pink-500 rounded-full">
                  {chat.unreadCount}
                </span>
              )} */}
            </div>
          ))}
        </div>

        {/* Chat Interface */}
        {selectedChat && (
          <motion.div
            className="fixed inset-0 bg:black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="bg-white/95 p-4 border-b border-gray-100/50 flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <span className="text-sm font-semibold text-white">S</span>
                      </motion.div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-base font-medium text-gray-800">{selectedChat.productSeller}</h2>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Online
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseChat}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
                <div className="bg-green-600 border border-gray-100/50 rounded-lg p-3 flex items-center gap-3">
                  <div className="relative w-20 h-12">
                    <Image
                      src={"/placeholder.jpg"}
                      alt={productName || "Product"}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white line-clamp-2">
                      {productName || "Unnamed Product"}
                    </p>
                    <p className="text-xs text-white line-clamp-1">{productDescription || "No description"}</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-[20rem] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white/50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {isChatLoading ? (
                  <div className="text-center text-gray-400 text-sm">Loading messages...</div>
                ) : chatError ? (
                  <div className="text-center text-red-400 text-sm">{chatError}</div>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} group`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`relative max-w-[70%] p-3 rounded-lg shadow-sm group ${
                            msg.sender === "user"
                              ? "bg-indigo-500 text-white rounded-br-none"
                              : "bg-white/80 border border-gray-100/50 text-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          {msg.proposedPrice && (
                            <div className="mt-2 bg-yellow-100/20 rounded-md px-2 py-1 text-xs text-white">
                              Proposed: ${parseFloat(msg.proposedPrice).toFixed(2)}
                            </div>
                          )}
                          {msg.attachments?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:underline"
                                >
                                  Attachment {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === "user" ? "text-indigo-200" : "text-gray-400"
                            }`}
                          >
                            {msg.timestamp}
                          </p>
                          {msg.sender === "user" && (
                            <motion.button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="absolute bottom-2 right-2 text-white hover:text-red-400 transition-opacity"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                          <div
                            className={`absolute top-2 w-2 h-2 transform rotate-45 ${
                              msg.sender === "user"
                                ? "bg-indigo-500 -right-1"
                                : "bg-white -left-1 border-l border-b border-gray-100/50"
                            }`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {isTyping && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="bg-white/80 border border-gray-100/50 rounded-lg p-3 relative">
                      <div className="flex gap-1.5">
                        <div
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <div className="absolute top-2 w-2 h-2 transform rotate-45 bg-white -left-1 border-l border-b border-gray-100/50" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white/95 border-t border-gray-100/50">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={isSending || !chatId}
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-50/50 border border-gray-100/50 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 transition-all"
                      disabled={isSending || !chatId}
                    />
                    <button
                      onClick={handlePriceClick}
                      className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-medium hover:bg-indigo-600 transition-colors"
                      disabled={isSending || !chatId}
                    >
                      ₹
                    </button>
                    <motion.button
                      onClick={handleSendMessage}
                      disabled={
                        (!newMessage.trim() && !proposedPrice) ||
                        isSending ||
                        !chatId ||
                        !selectedChat?.productId
                      }
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                        (!newMessage.trim() && !proposedPrice) ||
                        isSending ||
                        !chatId ||
                        !selectedChat?.productId
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-indigo-500 text-white hover:bg-indigo-600"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isSending ? (
                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>

                  {showPropose && (
                    <div className="flex flex-col gap-2 p-3 bg-white/80 border border-gray-100/50 rounded-lg shadow-sm">
                      <textarea
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        placeholder="Enter price (e.g., 99.99)"
                        className="w-full bg-gray-50/50 border border-gray-100/50 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-200 transition-all resize-none h-12"
                        disabled={isSending || !chatId}
                      />
                      <motion.button
                        onClick={handleSendMessage}
                        disabled={
                          (!newMessage.trim() && !proposedPrice) ||
                          isSending ||
                          !chatId ||
                          !selectedChat?.productId
                        }
                        className={`w-full py-2 rounded-lg flex items-center justify-center transition-all ${
                          (!newMessage.trim() && !proposedPrice) ||
                          isSending ||
                          !chatId ||
                          !selectedChat?.productId
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-indigo-500 text-white hover:bg-indigo-600"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Send Offer
                      </motion.button>
                    </div>
                  )}
                </div>

                {showOffer && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
                    <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Make Offer</h3>
                        <button
                          onClick={() => setShowOffer(false)}
                          className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                        >
                          Close
                        </button>
                      </div>
                      <div className="mt-4">
                        <button
                          className="w-full py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors mb-2"
                          onClick={() => {
                            setProposedPrice("20,200");
                            setShowOffer(false);
                          }}
                        >
                          ₹ 20,200
                        </button>
                        <button
                          className="w-full py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors mb-2"
                          onClick={() => {
                            setProposedPrice("19,100");
                            setShowOffer(false);
                          }}
                        >
                          ₹ 19,100
                        </button>
                        <button
                          className="w-full py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors mb-2"
                          onClick={() => {
                            setProposedPrice("18,100");
                            setShowOffer(false);
                          }}
                        >
                          ₹ 18,100
                        </button>
                        <button
                          className="w-full py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                          onClick={() => {
                            setProposedPrice("17,100");
                            setShowOffer(false);
                          }}
                        >
                          ₹ 17,100
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}