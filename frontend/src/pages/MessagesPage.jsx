import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/SocketContext";
import axios from "axios";

export default function MessagesPage() {
  const { token, user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();

    // Check if routed here to start a new chat
    if (location.state?.userId && location.state?.userName) {
      setSelectedUser({
        id: location.state.userId,
        name: location.state.userName,
      });
      fetchMessages(location.state.userId);
      // Clear location state to prevent persistent loops
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (socket) {
      socket.on("receive_message", (data) => {
        if (selectedUser && data.senderId === selectedUser.id) {
          setMessages((prev) => [
            ...prev,
            {
              sender_id: data.senderId,
              message: data.message,
              sent_at: data.timestamp,
            },
          ]);
          scrollToBottom();
        }
        // Refresh conversations
        fetchConversations();
      });

      socket.on("user_typing", (data) => {
        if (selectedUser && data.senderId === selectedUser.id) {
          setTyping(true);
        }
      });

      socket.on("user_stopped_typing", (data) => {
        if (selectedUser && data.senderId === selectedUser.id) {
          setTyping(false);
        }
      });

      return () => {
        socket.off("receive_message");
        socket.off("user_typing");
        socket.off("user_stopped_typing");
      };
    }
  }, [socket, selectedUser]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/messages/conversations",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setConversations(response.data.conversations);
    } catch (err) {
      console.error("Fetch conversations error:", err);
    }
  };

  const fetchMessages = async (otherUserId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/${otherUserId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessages(response.data.messages);
      scrollToBottom();
    } catch (err) {
      console.error("Fetch messages error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (conversation) => {
    setSelectedUser({
      id: conversation.other_user_id,
      name: conversation.other_user_name,
    });
    fetchMessages(conversation.other_user_id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/messages",
        {
          receiver_id: selectedUser.id,
          message: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Add message to local state
      setMessages((prev) => [...prev, response.data.data]);
      setNewMessage("");
      scrollToBottom();

      // Emit via socket
      if (socket) {
        socket.emit("send_message", {
          senderId: user.id,
          receiverId: selectedUser.id,
          message: newMessage,
        });
      }

      // Refresh conversations
      fetchConversations();
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.emit("typing", {
        senderId: user.id,
        receiverId: selectedUser.id,
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", {
          senderId: user.id,
          receiverId: selectedUser.id,
        });
      }, 2000);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const isOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] grid grid-cols-1 lg:grid-cols-12 bg-surface-container rounded-card border border-outline overflow-hidden shadow-2xl animate-in fade-in duration-500">
        
        {/* Conversations Sidebar */}
        <aside className="lg:col-span-4 border-r border-outline bg-surface-container-low flex flex-col h-full overflow-hidden">
          <div className="p-8 border-b border-outline bg-surface">
            <h2 className="text-2xl font-black font-headline tracking-tighter text-on-surface uppercase italic">Conversations</h2>
            <div className="mt-6 relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 text-sm group-focus-within:text-primary transition-colors">search</span>
                <input 
                    type="text" 
                    placeholder="Search messages..." 
                    className="w-full bg-surface border border-outline rounded-xl pl-12 pr-4 py-3 text-xs text-on-surface outline-none focus:border-primary/50 transition-all font-medium"
                />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            {conversations.length === 0 ? (
              <div className="py-20 text-center space-y-4 opacity-20 italic">
                <span className="material-symbols-outlined text-5xl">forum</span>
                <p className="text-[10px] uppercase font-black tracking-[0.2em]">No active conversations</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.other_user_id}
                  className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all border group ${
                    selectedUser?.id === conv.other_user_id 
                    ? "bg-primary/[0.08] border-primary/20 shadow-lg shadow-primary/5" 
                    : "bg-transparent border-transparent hover:bg-on-surface/[0.03] hover:border-outline"
                  }`}
                  onClick={() => handleSelectUser(conv)}
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center font-black text-on-primary text-xl shadow-lg group-hover:scale-[1.02] transition-transform uppercase italic">
                      {conv.other_user_name?.charAt(0)}
                    </div>
                    {isOnline(conv.other_user_id) && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-surface-container rounded-full shadow-lg"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-black text-on-surface truncate uppercase italic tracking-tight">{conv.other_user_name}</h4>
                        {!conv.is_read && <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/40 mt-1"></div>}
                    </div>
                    <p className={`text-[11px] truncate tracking-tight ${!conv.is_read ? "text-on-surface font-black" : "text-on-surface-variant/60 font-medium"}`}>
                      {conv.last_message || "Start a conversation..."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="lg:col-span-8 flex flex-col h-full bg-surface">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-40 h-40 rounded-full bg-surface-container border border-outline flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-primary/10 text-8xl italic font-black">chat_bubble</span>
                </div>
                <div className="space-y-3">
                    <h3 className="text-3xl font-black text-on-surface uppercase italic tracking-tighter">Select a Conversation</h3>
                    <p className="text-on-surface-variant font-medium text-sm max-w-sm mx-auto opacity-60 leading-relaxed">Choose a thread from the sidebar to view messages and start communicating.</p>
                </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-outline bg-surface-container-low flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-black text-xl italic shadow-lg shadow-primary/20">
                    {selectedUser.name?.charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-black text-on-surface tracking-tight uppercase italic">{selectedUser.name}</h3>
                    {isOnline(selectedUser.id) ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></span>
                        Online now
                      </span>
                    ) : (
                        <span className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em] italic">Offline</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-xl bg-surface border border-outline text-on-surface-variant/60 flex items-center justify-center hover:text-primary hover:border-primary/20 transition-all active:scale-95">
                        <span className="material-symbols-outlined text-lg">info</span>
                    </button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide bg-[radial-gradient(circle_at_2px_2px,currentColor_1px,transparent_0)] bg-[size:32px_32px] [background-position:0_0] text-on-surface-variant/[0.03]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 italic">Loading messages...</p>
                    </div>
                ) : (
                  <>
                    <div className="text-center pb-12 pt-4">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-surface-container border border-outline shadow-sm">
                            <span className="material-symbols-outlined text-xs text-emerald-500">lock</span>
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 italic">End-to-End Encrypted Message Thread</span>
                        </div>
                    </div>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      >
                        <div className={`max-w-[70%] space-y-2 flex flex-col ${msg.sender_id === user.id ? "items-end text-right" : "items-start text-left"}`}>
                           <div className={`p-5 rounded-3xl text-sm font-medium shadow-2xl ${
                                msg.sender_id === user.id 
                                ? "bg-primary text-on-primary rounded-br-none shadow-primary/10" 
                                : "bg-surface-container text-on-surface border border-outline rounded-bl-none shadow-black/5"
                            }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            </div>
                            <span className="text-[9px] font-black text-on-surface-variant/30 px-3 uppercase tracking-widest italic font-mono">
                                {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                      </div>
                    ))}
                    {typing && (
                      <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="bg-surface-container border border-outline p-5 rounded-3xl rounded-bl-none flex gap-2 shadow-xl shadow-black/5">
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input Area */}
              <form className="p-8 border-t border-outline bg-surface-container-low" onSubmit={handleSendMessage}>
                <div className="flex gap-5 max-w-5xl mx-auto">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder="Type your message..."
                            className="w-full bg-surface border border-outline rounded-2xl px-8 py-5 text-on-surface text-sm outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/30 font-medium shadow-inner"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="bg-primary hover:bg-primary-hover disabled:opacity-30 disabled:hover:scale-100 text-on-primary px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-3 shadow-xl shadow-primary/20 italic"
                    >
                        Send <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                </div>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
