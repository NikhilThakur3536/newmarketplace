"use client"

import { useState, useEffect, useRef} from "react";
import { useChat } from "@/app/context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Send, Trash2 } from "lucide-react";
import Image from "next/image";

export default function ChatInterface  ({ onClose, productId, varientId, inventoryId,productImage,productName,productDescription,productSeller}) {
  const { chatId, messages, isSending, isChatLoading, chatError, sendMessage, fetchMessages, deleteMessage, participantId } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showPropose, setShowPropose] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId, fetchMessages]);

  const handleSendMessage = async () => {
    if ((newMessage.trim() || proposedPrice) && !isSending && chatId && productId) {
      const messageText = proposedPrice ? `${newMessage.trim()}` : newMessage.trim();
      const success = await sendMessage(chatId, messageText, proposedPrice || null, productId);
      if (success) {
        setNewMessage('');
        setProposedPrice('');
        setShowPropose(false);
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }, 1000);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (messageId) {
      deleteMessage(messageId);
    }
  };

  const handlePriceClick = () => {
    setShowOffer(true);
    setShowPropose(true);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
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
        transition={{ duration: 0.4, ease: 'easeOut' }}
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
                <h2 className="text-base font-medium text-gray-800">{productSeller}</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
          <div className="bg-green-600 border border-gray-100/50 rounded-lg p-3 flex items-center gap-3">
            <div className="relative w-20 h-12">
              <Image
                src={productImage || "/placeholder.jpg"}
                alt={productName || "Product"}
                fill
                className="object-cover rounded-md"
              />  
            </div>
            <div>
              <p className="text-sm font-medium text-white line-clamp-2">{productName || "Unnamed Product"}</p>
              <p className="text-xs text-white line-clamp-1">{productDescription}</p>
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
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`relative max-w-[70%] p-3 rounded-lg shadow-sm group ${
                      msg.sender === 'user'
                        ? 'bg-indigo-500 text-white rounded-br-none'
                        : 'bg-white/80 border border-gray-100/50 text-gray-800 rounded-bl-none'
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
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </p>
                    {msg.sender === 'user' && (
                      <motion.button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="absolute bottom-2 right-2 text-white hover:text-red-400  transition-opacity"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                    <div
                      className={`absolute top-2 w-2 h-2 transform rotate-45 ${
                        msg.sender === 'user'
                          ? 'bg-indigo-500 -right-1'
                          : 'bg-white -left-1 border-l border-b border-gray-100/50'
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
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
            {/* Message Input */}
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
                disabled={(!newMessage.trim() && !proposedPrice) || isSending || !chatId || !productId}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  (!newMessage.trim() && !proposedPrice) || isSending || !chatId || !productId
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
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

            {/* Propose Price Section (hidden until rupee button is clicked) */}
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
                  disabled={(!newMessage.trim() && !proposedPrice) || isSending || !chatId || !productId}
                  className={`w-full py-2 rounded-lg flex items-center justify-center transition-all ${
                    (!newMessage.trim() && !proposedPrice) || isSending || !chatId || !productId
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-500 text-white hover:bg-indigo-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Offer
                </motion.button>
              </div>
            )}
          </div>

          {/* Make Offer Popup */}
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
                      setProposedPrice('20,200');
                      setShowOffer(false);
                    }}
                  >
                    ₹ 20,200
                  </button>
                  <button
                    className="w-full py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors mb-2"
                    onClick={() => {
                      setProposedPrice('19,100');
                      setShowOffer(false);
                    }}
                  >
                    ₹ 19,100
                  </button>
                  <button
                    className="w-full py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors mb-2"
                    onClick={() => {
                      setProposedPrice('18,100');
                      setShowOffer(false);
                    }}
                  >
                    ₹ 18,100
                  </button>
                  <button
                    className="w-full py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                    onClick={() => {
                      setProposedPrice('17,100');
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
  );
};