"use client"

import { useState, useRef, useEffect } from "react"
import { Send, DollarSign, Smile, Paperclip, MoreVertical, Phone, Video } from "lucide-react"
import { useChat } from "@/app/context/ChatContext"

export default function MobileChatUI({ participantId, chatId }) {
  const { messages, fetchMessages, sendMessage, isChatLoading, chatError, productName } = useChat()
  const [newMessage, setNewMessage] = useState("")
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [priceAmount, setPriceAmount] = useState("")
  const [priceDescription, setPriceDescription] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId)
    }
  }, [chatId, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (newMessage.trim() && chatId) {
      const success = await sendMessage(chatId, newMessage)
      if (success) {
        setNewMessage("")
        // Simulate typing indicator
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
        }, 2000)
      }
    }
  }

  const handleSendPriceProposal = async () => {
    if (priceAmount && priceDescription && chatId) {
      const success = await sendMessage(chatId, priceDescription, Number.parseFloat(priceAmount))
      if (success) {
        setShowPriceModal(false)
        setPriceAmount("")
        setPriceDescription("")
      }
    }
  }

  const formatTime = (timestamp) => {
    // If timestamp is already formatted as a string (e.g., "2:30 PM"), return it
    if (typeof timestamp === "string") {
      return timestamp
    }
    // Otherwise, assume it's a Date object and format it
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <>
      <div className="w-full max-w-md h-[80vh] bg-transparent rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E72068] to-[#FF6B9D] py-4 pl-4 pr-12 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold">JD</div>
            <div>
              <h3 className="font-semibold">Seller</h3>
              <p className="text-sm opacity-90">{productName || "Online"}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Phone className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Video className="h-4 w-4" />
            </button>
            {/* <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button> */}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {isChatLoading && (
            <div className="text-center text-slate-500">Loading messages...</div>
          )}
          {chatError && (
            <div className="text-center text-red-500">{chatError}</div>
          )}
          {!isChatLoading && !chatError && messages.length === 0 && (
            <div className="text-center text-slate-500">No messages yet</div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              <div className={`max-w-[80%] ${message.sender === "user" ? "order-2" : "order-1"}`}>
                {message.proposedPrice ? (
                  <div className="bg-gradient-to-r from-[#E72068] to-[#FF6B9D] text-white p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-sm">Price Proposal</span>
                    </div>
                    <div className="text-2xl font-bold mb-2">${message.proposedPrice}</div>
                    <p className="text-sm opacity-90 mb-3">{message.text}</p>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                        Accept
                      </button>
                      <button className="px-3 py-1 border border-white/30 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[#E72068] to-[#FF6B9D] text-white"
                        : "bg-white text-slate-900 shadow-sm border border-slate-200"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                )}
                <div
                  className={`flex items-center space-x-1 mt-1 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>
                  {message.sender === "user" && (
                    <div className="flex space-x-1">
                      <div
                        className={`w-1 h-1 rounded-full ${message.status === "sent" ? "bg-slate-400" : message.status === "delivered" ? "bg-[#E72068]" : "bg-green-500"}`}
                      />
                      <div
                        className={`w-1 h-1 rounded-full ${message.status === "delivered" || message.status === "read" ? "bg-[#E72068]" : "bg-slate-300"}`}
                      />
                    </div>
                  )}
                </div>
              </div>
              {message.sender !== "user" && (
                <div className="w-8 h-8 bg-gradient-to-br from-[#E72068] to-[#FF6B9D] rounded-full flex items-center justify-center text-white text-xs font-semibold order-1 mr-2 flex-shrink-0">
                  JD
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#E72068] to-[#FF6B9D] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  JD
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <button
              onClick={() => setShowPriceModal(true)}
              className="bg-gradient-to-r from-[#E72068] to-[#FF6B9D] hover:from-[#C1185C] hover:to-[#E72068] text-white px-4 py-2 rounded-lg font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <DollarSign className="h-4 w-4" />
              <span>Propose Price</span>
            </button>
            <div className="bg-[#E72068]/10 text-[#E72068] px-3 py-1 rounded-full text-xs font-medium">
              Quick Actions
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Paperclip className="h-4 w-4 text-slate-600" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-full focus:border-[#E72068] focus:ring-2 focus:ring-[#E72068]/20 focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors">
                <Smile className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-[#E72068] to-[#FF6B9D] hover:from-[#C1185C] hover:to-[#E72068] text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Price Proposal Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scaleIn">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-[#E72068] to-[#FF6B9D] rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Propose Price</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#E72068] focus:ring-2 focus:ring-[#E72068]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={priceDescription}
                  onChange={(e) => setPriceDescription(e.target.value)}
                  placeholder="Describe what this covers..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#E72068] focus:ring-2 focus:ring-[#E72068]/20 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPriceModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendPriceProposal}
                className="flex-1 bg-gradient-to-r from-[#E72068] to-[#FF6B9D] hover:from-[#C1185C] hover:to-[#E72068] text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Send Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}