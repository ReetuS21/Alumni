import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { subscribeToChat, sendChatMessage } from "../services/dataService";
import { MessageSquare, Send } from "lucide-react";

export const GlobalDiscussionBox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToChat((newMsgs) => {
      setMessages(newMsgs);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    setSending(true);
    try {
      await sendChatMessage({
        senderUid: user.uid,
        senderName: user.name || user.email.split("@")[0],
        senderRole: user.role,
        text: inputText.trim()
      });
      setInputText("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "student":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "teacher":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "alumni":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-[20px] border border-slate-200/80 shadow-2xs flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 bg-[#f4f6fa]/50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-2xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs leading-tight">Global Discussion Box</h3>
            <p className="text-[10px] text-slate-400">Live chat for Students, Teachers & Alumni</p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Sync</span>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#f4f6fa]/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <MessageSquare className="w-8 h-8 mb-1 stroke-1" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user && user.uid === msg.senderUid;
            return (
              <div
                key={msg.id || msg.sentAt}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(
                      msg.senderRole
                    )}`}
                  >
                    {msg.senderRole}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <div
                  className={`max-w-xs sm:max-w-sm p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none shadow-2xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-2xs"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-100 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question or post a message..."
          className="flex-1 bg-[#f4f6fa] text-slate-900 placeholder-slate-400 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-3 py-2 rounded-xl flex items-center space-x-1 transition-all text-xs shadow-2xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
