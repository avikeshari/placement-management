import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import getErrorMessage from "../utils/getErrorMessage";
import { useAuth } from "../context/AuthContext";

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedId),
    [conversations, selectedId]
  );

  const loadConversations = useCallback(async (keepSelection = true) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/messages");
      const items = response.data.conversations || [];
      setConversations(items);
      const requestedApplication = searchParams.get("application");
      const requestedConversation = searchParams.get("conversation");
      const requested = items.find((item) =>
        (requestedConversation && item._id === requestedConversation) ||
        (requestedApplication && item.application?._id === requestedApplication)
      );

      if (requested) {
        setSelectedId(requested._id);
      } else if (items.length && (!keepSelection || !items.some((item) => item._id === selectedId))) {
        setSelectedId(items[0]._id);
      }
      if (!items.length) setSelectedId(null);
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load messages."));
    } finally {
      setLoading(false);
    }
  }, [selectedId, searchParams]);

  const loadMessages = useCallback(async (conversationId, showLoader = true) => {
    if (!conversationId) return;
    try {
      if (showLoader) setMessageLoading(true);
      const response = await api.get(`/messages/${conversationId}/messages`);
      setMessages(response.data.messages || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load conversation."));
    } finally {
      setMessageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations(false);
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return undefined;
    }

    loadMessages(selectedId);
    const interval = window.setInterval(() => loadMessages(selectedId, false), 5000);
    return () => window.clearInterval(interval);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selectedId || sending) return;

    try {
      setSending(true);
      const response = await api.post(`/messages/${selectedId}/messages`, { body });
      setMessages((current) => [...current, response.data.message]);
      setDraft("");
      await loadConversations();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send message."));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader text="Loading messages..." />;
  if (error) return <ErrorState message={error} onRetry={() => loadConversations(false)} />;

  if (!conversations.length) {
    return (
      <EmptyState
        title="No connections yet"
        message="Messaging becomes available when a company schedules an interview for your application."
      />
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Messages</h1>
        <p className="text-slate-500 mt-2">
          Connect directly with companies or candidates after an interview is scheduled.
        </p>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-5 bg-white border rounded-2xl overflow-hidden min-h-[620px]">
        <aside className="border-r bg-slate-50">
          <div className="p-4 border-b bg-white">
            <h2 className="font-semibold">Connections</h2>
            <p className="text-xs text-slate-500 mt-1">Interview-related conversations</p>
          </div>
          <div className="divide-y">
            {conversations.map((conversation) => {
              const other = user?.role === "student" ? conversation.company : conversation.student;
              const active = conversation._id === selectedId;
              return (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => setSelectedId(conversation._id)}
                  className={`w-full text-left p-4 transition ${active ? "bg-blue-50" : "hover:bg-white"}`}
                >
                  <p className="font-semibold text-slate-800 truncate">{other?.name || "Connection"}</p>
                  <p className="text-xs text-slate-500 truncate mt-1">{conversation.job?.title || "Placement Interview"}</p>
                  {conversation.lastMessage && (
                    <p className="text-xs text-slate-500 truncate mt-2">{conversation.lastMessage}</p>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex flex-col min-w-0">
          {selectedConversation ? (
            <>
              <header className="p-4 border-b">
                <h2 className="font-bold text-lg">
                  {user?.role === "student" ? selectedConversation.company?.name : selectedConversation.student?.name}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedConversation.job?.title || "Placement Interview"}
                </p>
              </header>

              <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-slate-50 min-h-[450px] max-h-[560px]">
                {messageLoading && !messages.length ? (
                  <Loader text="Loading conversation..." />
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const mine = String(message.sender?._id || message.sender) === String(user?._id);
                      return (
                        <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${mine ? "bg-blue-600 text-white" : "bg-white border text-slate-700"}`}>
                            <p className="text-sm whitespace-pre-line break-words">{message.body}</p>
                            <p className={`text-[10px] mt-2 ${mine ? "text-blue-100" : "text-slate-400"}`}>
                              {new Date(message.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <form onSubmit={send} className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    maxLength={2000}
                    rows={2}
                    placeholder="Write a message..."
                    className="flex-1 border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="self-end bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Maximum 2000 characters.</p>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-slate-500">Select a conversation.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Messages;
