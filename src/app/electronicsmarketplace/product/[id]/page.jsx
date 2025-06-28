"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ShoppingCart, Minus, Plus, Heart, Send, Smile,Trash2 } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import { motion,AnimatePresence } from "framer-motion";
import { useChat } from "@/app/context/ChatContext";
import { useCart } from "@/app/context/CartContext";
import { useFavorite } from "@/app/context/FavouriteContext";
import toast from "react-hot-toast";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const languageId = "2bfa9d89-61c4-401e-aae3-346627460558";

const ChatInterface = ({ onClose, productId, varientId, inventoryId,productImage,productName,productDescription,productSeller}) => {
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
  const [showChat, setShowChat] = useState(false);
  const { initiateChat, clearChat } = useChat();
  const { addToCart, cartCount } = useCart();
  const { favoriteItems, toggleFavorite } = useFavorite();

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
        // console.log(response.data.data?.rows)
        if (response.data.success && Array.isArray(response.data.data?.rows) && response.data.data.rows.length > 0) {
          prod = response.data.data.rows.find((p) => p.id === id);
          if (prod) {
            setProduct({
              id: prod.id,
              name: prod.productLanguages?.[0]?.name || "Unnamed Product",
              price: prod.varients?.[0]?.inventory?.price || 0,
              image: prod.productImages?.[0]?.url || "/placeholder.jpg",
              brand: prod.manufacturer?.name || "Unknown",
              storeId: prod.store?.id || null,
              sellerName:prod.store?.name,
              category: prod.category?.categoryLanguages?.[0]?.name || "General",
              categoryId: prod.category?.id || null,
              rating: prod.rating || 4,
              reviews: prod.reviews || 10,
              specifications: Array.isArray(prod.specifications) ? prod.specifications : [],
              longDescription: prod.productLanguages?.[0]?.longDescription || "No description available",
              varientId: prod.varients?.[0]?.id,
              inventoryId:prod.varients?.[0]?.inventory?.id
            });
          } else {
            setError("Product not found in response");
          }
        } else {
          setError("No products found in response");
        }
      } catch (err) {
        setError(`Failed to fetch product: ${err.message || "Unknown error occurred"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductById();
  }, [id]);

  useEffect(() => {
    // console.log("product details", product);
  });

  useEffect(() => {
    if (!product?.categoryId) return;

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
        if (response.data.success && Array.isArray(response.data.data?.rows) && response.data.data.rows.length > 0) {
          const products = response.data.data.rows
            .filter((p) => String(p.id) !== String(id))
            .map((p) => ({
              id: p.id,
              name: p.productLanguages?.[0]?.name || "Unnamed Product",
              price: p.varients?.[0]?.inventory?.price || 0,
              image: p.productImages?.[0]?.url || "/placeholder.jpg",
              varientId: p.varients?.[0]?.id,
            }))
            .filter((p) => p.id);
          setSimilarProducts(products);
        } else {
          setSimilarProducts([]);
          setSimilarProductsError("No similar products found.");
        }
      } catch (err) {
        setSimilarProductsError(`Failed to fetch similar products: ${err.message || "Unknown error occurred"}`);
      } finally {
        setSimilarProductsLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [product?.categoryId, id]);

  const handleOpenChat = async () => {
    if (!product?.storeId) {
      console.warn("⚠️ No manufacturer ID available for chat");
      return;
    }

    const newChatId = await initiateChat(product.storeId,product.id,product.varientId,product.inventoryId);
    if (newChatId) {
      setShowChat(true);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    clearChat();
  };

  const handleFavoriteClick = (simProduct) => {
    const isFavorite = favoriteItems.some((item) => item.id === simProduct.id || item.productId === simProduct.id);
    const name = simProduct.name || "Item";

    toggleFavorite({
      productId: simProduct.id,
      name,
      isFavorite,
    });
    toast.dismiss("removefav-toast");
    toast.custom(
      <div
        className={`px-4 py-2 rounded-lg shadow-md font-semibold text-white ${isFavorite ? "bg-red-600" : "bg-green-600"}`}
      >
        {isFavorite ? `${name} removed from favorites` : `${name} added to favorites`}
      </div>,
      { id: "removefav-toast", duration: 500 }
    );
  };

  const addToCartHandler = async (product, qty, varientId) => {
    try {
      const payload = {
        productId: product.id,
        quantity: qty,
        varientId: varientId,
      };
      await addToCart(payload);
      
      setQuantity(1);
    } catch (err) {
      // console.log(err)
    }
  };

  const formatPrice = (price) => `$${parseFloat(price).toFixed(2)}`;

  if (loading) return <div className="p-10 text-center text-gray-500">Loading product...</div>;
  if (error || !product) return <div className="p-10 text-center text-red-500">{error || "Product not found."}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 shadow-sm flex items-center justify-between relative">
        <button onClick={() => router.push("/electronicsmarketplace")}>
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-semibold text-lg">Product Details</h1>
        <button onClick={() => router.push("/electronicsmarketplace/cart")}>
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-2xl p-4 relative h-56">
          <Image fill src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-lg bg-gray-100" />
        </div>

        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-900 flex-1">{product.name}</h1>
            <button
              onClick={handleOpenChat}
              className="p-2 bg-green-500 text-white rounded-lg text-sm z-40"
              disabled={!product.storeId}
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
                {similarProducts.map((simProduct) => {
                  const isFavorite = favoriteItems.some(
                    (item) => item.id === simProduct.id || item.productId === simProduct.id
                  );
                  return (
                    <div key={simProduct.id} className="min-w-[200px] bg-white rounded-2xl p-4 shadow-sm">
                      <div className="relative mb-3">
                        <img
                          src={simProduct.image}
                          alt={simProduct.name}
                          className="w-full h-32 object-cover rounded-lg bg-gray-100"
                        />
                        <button
                          onClick={() => handleFavoriteClick(simProduct)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm"
                        >
                          <Heart
                            className="w-4 h-4"
                            fill={isFavorite ? "red" : "white"}
                            stroke={isFavorite ? "red" : "black"}
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
                      <button
                        onClick={() => addToCartHandler(simProduct, 1, simProduct.varientId)}
                        className="w-full mt-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                    </div>
                  );
                })}
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
            onClick={() => addToCartHandler(product, quantity, product.varientId)}
            className="w-[80%] py-4 bg-green-500 text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>

      {showChat && product && <ChatInterface 
        onClose={handleCloseChat} 
        productId={product.id} 
        variantId={product.varientId} 
        inventoryId={product.inventoryId} 
        productName={product.name} 
        productImage={product.image}
        productDescription={product.longDescription}
        productSeller={product.sellerName}
      />}
    </div>
  );
}