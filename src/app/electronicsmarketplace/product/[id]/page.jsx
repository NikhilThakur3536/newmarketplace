"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ShoppingCart, Minus, Plus, Heart, Send, Smile } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import { useChat } from "@/app/context/ChatContext";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";

const ChatInterface = ({ onClose, participantId }) => {
  const { chatId, messages, isSending, isChatLoading, chatError, sendMessage, fetchMessages } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId, participantId);
    }
  }, [chatId, participantId, fetchMessages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isSending && chatId) {
      const success = await sendMessage(chatId, newMessage);
      if (success) {
        setNewMessage("");
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

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/30 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">AC</span>
                  </div>
                </motion.div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <motion.h2 className="text-lg font-semibold text-gray-800">Seller</motion.h2>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />Online
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 transition-all duration-300"
            >
              <span className="text-sm font-semibold">Close</span>
            </button>
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/20 to-gray-50/20 scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
          {isChatLoading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : chatError ? (
            <div className="text-center text-red-500">{chatError}</div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div
                  className={`max-w-xs px-5 py-3 rounded-2xl relative group ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md shadow-lg"
                      : "bg-white/90 text-gray-800 border border-gray-200/50 rounded-bl-md shadow-md backdrop-blur-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  {msg.attachments?.length > 0 && (
                    <div className="mt-2">
                      {msg.attachments.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 underline"
                        >
                          Attachment {i + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className={`text-xs mt-2 ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {msg.timestamp}
                  </p>
                  <div
                    className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 -right-1"
                        : "bg-white -left-1 border-l border-b border-gray-200/50"
                    }`}
                  />
                </div>
              </motion.div>
            ))
          )}
          {isTyping && (
            <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white/90 text-gray-800 border border-gray-200/50 rounded-2xl rounded-bl-md px-5 py-3 shadow-md backdrop-blur-sm relative">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <div className="absolute top-4 w-3 h-3 transform rotate-45 bg-white -left-1 border-l border-b border-gray-200/50" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-200/30">
          <div className="flex items-center gap-3">
            <button className="h-12 w-12 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 transition-all">
              <Smile className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full bg-gray-50/80 border border-gray-200/50 rounded-2xl px-5 py-4 text-sm placeholder:text-gray-400 focus:bg-white focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200/50 shadow-sm"
                disabled={isSending || !chatId}
              />
              {newMessage && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending || !chatId}
              className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                !newMessage.trim() || isSending || !chatId
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-110 active:scale-95"
              }`}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarProductsError, setSimilarProductsError] = useState(null);
  const [similarProductsLoading, setSimilarProductsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const { initiateChat, clearChat } = useChat();

  useEffect(() => {
    const fetchProductById = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      const url = `${BASE_URL}/user/product/listv2`;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const body = {
        limit: 4000,
        offset: 0,
        languageId,
      };

      let prod = null;
      try {
        const response = await axios.post(url, body, { headers });
        // console.log(" API Response:", response.data);

        if (response.data.success && Array.isArray(response.data.data?.rows) && response.data.data.rows.length > 0) {
          prod = response.data.data.rows.find((p) => p.id === id);
          if (prod) {
            // Log warnings for missing arrays but proceed with fallbacks
            if (!Array.isArray(prod.productLanguages) || prod.productLanguages.length === 0) {
              console.warn(" Product has no valid productLanguages:", prod);
            }
            if (!Array.isArray(prod.variants) || prod.variants.length === 0) {
              console.warn(" Product has no valid variants:", prod);
            }
            if (!Array.isArray(prod.productImages) || prod.productImages.length === 0) {
              console.warn(" Product has no valid productImages:", prod);
            }

            setProduct({
              id: prod.id,
              name: prod.productLanguages?.[0]?.name || "Unnamed Product",
              price: prod.varients?.[0]?.inventory?.price || 0,
              image: prod.productImages?.[0]?.url || "/placeholder.jpg",
              brand: prod.manufacturer?.name || "Unknown",
              manufacturerId: prod.manufacturer?.id || null,
              category: prod.category?.categoryLanguages?.[0]?.name || "General",
              categoryId: prod.category?.id || null,
              rating: prod.rating || 4,
              reviews: prod.reviews || 10,
              specifications: Array.isArray(prod.specifications) ? prod.specifications : [],
              longDescription: prod.productLanguages?.[0]?.longDescription || "No description available",
            });
            // console.log(" Matched Product:", prod);
          } else {
            setError("Product not found in response");
            console.warn(" Product with ID not found in response:", id);
          }
        } else {
          setError("No products found in response");
          console.warn(" No products found in response:", response.data);
        }
      } catch (err) {
        const errorMessage = err.message || "Unknown error occurred";
        setError(`Failed to fetch product: ${errorMessage}`);
        console.error(" Axios Error:", err.response?.data || err.message, err);
        if (prod) {
          console.error(" Product data at error:", prod);
        } else {
          console.error(" No product data available (prod is undefined)");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProductById();
  }, [id]);

  useEffect(() => {
    if (!product?.categoryId) {
      return;
    }

    const fetchSimilarProducts = async () => {
      setSimilarProductsLoading(true);
      setSimilarProductsError(null);

      const url = `${BASE_URL}/user/product/listv2`;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const body = {
        limit: 10,
        offset: 0,
        languageId,
        categoryIds: [product.categoryId],
      };

      try {
        const response = await axios.post(url, body, { headers });
        // console.log(" Similar Products API Response:", response.data);

        if (response.data.success && Array.isArray(response.data.data?.rows) && response.data.data.rows.length > 0) {
          const products = response.data.data.rows
            .filter((p) => String(p.id) !== String(id))
            .map((p) => {
              if (!Array.isArray(p.productLanguages) || p.productLanguages.length === 0) {
                console.warn(" Similar product has no valid productLanguages:", p);
              }
              if (!Array.isArray(p.variants) || p.variants.length === 0) {
                console.warn(" Similar product has no valid variants:", p);
              }
              if (!Array.isArray(p.productImages) || p.productImages.length === 0) {
                console.warn(" Similar product has no valid productImages:", p);
              }

              return {
                id: p.id,
                name: p.productLanguages?.[0]?.name || "Unnamed Product",
                price: p.varients?.[0]?.inventory?.price || 0,
                image: p.productImages?.[0]?.url || "/placeholder.jpg",
              };
            })
            .filter((p) => p.id); // Ensure valid products
          setSimilarProducts(products);
          // console.log(" Similar Products Set:", products);
        } else {
          console.warn("⚠️ No similar products found in response.");
          setSimilarProducts([]);
          setSimilarProductsError("No similar products found.");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setSimilarProductsError(`Failed to fetch similar products: ${errorMessage}`);
        console.error("🔥 Failed to fetch similar products:", err.response?.data || err.message);
      } finally {
        setSimilarProductsLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [product?.categoryId, id]);

  const handleOpenChat = async () => {
    if (!product?.manufacturerId) {
      console.warn("⚠️ No manufacturer ID available for chat");
      return;
    }

    const newChatId = await initiateChat(product.manufacturerId);
    if (newChatId) {
      setShowChat(true);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    clearChat();
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product, qty) => {
    // console.log(`Added ${qty} of ${product.name} to cart`);
    alert(`Added ${qty} of ${product.name} to cart`);
  };

  const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="p-10 text-center text-red-500">{error || "Product not found."}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between relative">
        <button onClick={() => router.push("/")}>
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-semibold text-lg">Product Details</h1>
        <button onClick={() => router.push("/cart")}>
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
          </div>
        </button>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-2xl p-4 relative h-56">
          <Image
            fill
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover rounded-lg bg-gray-100"
          />
        </div>

        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-900 flex-1">{product.name}</h1>
            <button
              onClick={handleOpenChat}
              className="p-2 bg-green-500 text-white rounded-lg text-sm"
              disabled={!product.manufacturerId}
            >
              💬 Chat
            </button>
          </div>
          <p className="text-gray-600 mb-4">{product.longDescription}</p>

          <div className="flex items-center justify-between mb-4">
            <p className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</p>
            <div className="text-right">
              <p className="text-sm text-gray-500">Model: Pro Max</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Manufacturer:</p>
              <p className="font-medium">{product.brand}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category:</p>
              <p className="font-medium">{product.category}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Specifications</h3>
            {product.specifications.map((spec, index) => (
              <div key={spec.id} className="mb-2 p-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 font-medium">{spec.specKey}</span>
                  <span className="text-sm text-blue-600">{spec.specValue}</span>
                </div>
                {index < product.specifications.length - 1 && (
                  <hr className="h-px border-t border-gray-100 my-2" />
                )}
              </div>
            ))}
          </div>

          {similarProductsLoading ? (
            <div className="mb-36 text-gray-500">Loading similar products...</div>
          ) : similarProductsError ? (
            <div className="mb-36 text-red-500">{similarProductsError}</div>
          ) : similarProducts.length > 0 ? (
            <div className="mb-36">
              <h3 className="font-medium mb-4">Similar Products</h3>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300">
                {similarProducts.map((simProduct) => (
                  <div
                    key={simProduct.id}
                    className="min-w-[200px] bg-white rounded-2xl p-4 shadow-sm"
                  >
                    <div className="relative mb-3">
                      <img
                        src={simProduct.image}
                        alt={simProduct.name}
                        className="w-full h-32 object-cover rounded-lg bg-gray-100"
                      />
                      <button
                        onClick={() => toggleFavorite(simProduct.id)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.includes(simProduct.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{simProduct.name}</h3>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(simProduct.price)}</p>
                    <button
                      onClick={() => router.push(`/electronicsmarketplace/product/${simProduct.id}`)}
                      className="w-full mt-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-36 text-gray-500">No similar products found.</div>
          )}
        </div>

        <div className="fixed bottom-0 transform -translate-x-4 w-full max-w-md bg-white shadow-lg z-10 rounded-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="text-xl font-semibold min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              addToCart(product, quantity);
              setQuantity(1);
            }}
            className="w-[80%] py-4 bg-green-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>

      {showChat && <ChatInterface onClose={handleCloseChat} participantId={product.manufacturerId} />}
    </div>
  );
}