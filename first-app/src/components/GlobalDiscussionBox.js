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
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "teacher":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "alumni":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg leading-tight">Global Discussion Box</h2>
            <p className="text-xs text-slate-500">Shared conversation for Students, Teachers & Alumni</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Real-time Sync</span>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
            <MessageSquare className="w-10 h-10 mb-2 stroke-1" />
            <p>No messages yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = user && user.uid === msg.senderUid;
            return (
              <div
                key={msg.id || msg.sentAt}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-semibold text-slate-700">{msg.senderName}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                      msg.senderRole
                    )}`}
                  >
                    {msg.senderRole}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                <div
                  className={`max-w-xl p-3.5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none"
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
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question, share advice or reply to someone..."
          className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-sm"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
