import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { AlertCircle, Menu, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ChatInput, type ChatMode } from "./components/ChatInput";
import { MessageBubble } from "./components/MessageBubble";
import { Sidebar } from "./components/Sidebar";
import { TypingIndicator } from "./components/TypingIndicator";
import { WelcomeScreen } from "./components/WelcomeScreen";

import type { ChatMessage } from "./backend.d";
import {
  useClearHistory,
  useCreateSession,
  useDeleteSession,
  useGenerateImage,
  useGenerateResponse,
  useGetHistory,
  useListSessions,
} from "./hooks/useQueries";
import { useTTS } from "./hooks/useTTS";

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("shristiai-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [language, setLanguage] = useState<"en" | "od">(() => {
    return (localStorage.getItem("shristiai-lang") as "en" | "od") || "en";
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("chat");
  const [activeSessionId, setActiveSessionId] = useState<bigint | null>(null);
  const [prefillText, setPrefillText] = useState<string | undefined>(undefined);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Apply dark mode to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("shristiai-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Persist language
  useEffect(() => {
    localStorage.setItem("shristiai-lang", language);
  }, [language]);

  // Queries & mutations
  const { data: history = [], isError: historyError } = useGetHistory();
  const { data: sessions = [], isError: sessionsError } = useListSessions();
  const generateResponse = useGenerateResponse();
  const generateImage = useGenerateImage();
  const clearHistory = useClearHistory();
  const createSession = useCreateSession();
  const deleteSession = useDeleteSession();

  const { speak, speakingId } = useTTS();

  // Sync history to local messages
  useEffect(() => {
    setLocalMessages(history);
  }, [history]);

  // Auto-scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally tracking mutation state
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, generateResponse.isPending, generateImage.isPending]);

  // Create initial session on load if none exist
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  const handleNewChat = useCallback(async () => {
    const name = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    try {
      const id = await createSession.mutateAsync(name);
      setActiveSessionId(id);
      toast.success(language === "od" ? "ନୂଆ ଚ୍ୟାଟ ତିଆରି" : "New chat created");
    } catch {
      toast.error(language === "od" ? "ତ୍ରୁଟି ଘଟିଲା" : "Failed to create chat");
    }
  }, [createSession, language]);

  const handleDeleteSession = useCallback(
    async (id: bigint) => {
      try {
        await deleteSession.mutateAsync(id);
        if (activeSessionId === id) setActiveSessionId(null);
        toast.success(language === "od" ? "ଚ୍ୟାଟ ଡିଲିଟ ହେଲା" : "Chat deleted");
      } catch {
        toast.error(language === "od" ? "ଡିଲିଟ ବିଫଳ" : "Failed to delete");
      }
    },
    [deleteSession, activeSessionId, language],
  );

  const handleSend = useCallback(
    async (message: string) => {
      // Optimistic: add user message immediately
      const tempUserMsg: ChatMessage = {
        id: BigInt(Date.now()),
        content: message,
        role: "user",
        language,
        timestamp: BigInt(Date.now() * 1_000_000),
      };
      setLocalMessages((prev) => [...prev, tempUserMsg]);

      if (mode === "image") {
        try {
          const result = await generateImage.mutateAsync({
            prompt: message,
            language,
          });
          // Add optimistic assistant image message
          const tempAssistantMsg: ChatMessage = {
            id: BigInt(Date.now() + 1),
            content: `Generated image for: ${result.prompt}`,
            role: "assistant",
            language,
            imageUrl: result.dataUrl,
            timestamp: BigInt((Date.now() + 1) * 1_000_000),
          };
          setLocalMessages((prev) => {
            const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
            return [...withoutTemp, tempUserMsg, tempAssistantMsg];
          });
        } catch {
          setLocalMessages((prev) =>
            prev.filter((m) => m.id !== tempUserMsg.id),
          );
          toast.error(
            language === "od" ? "ଚିତ୍ର ଉତ୍ପାଦନ ବିଫଳ" : "Image generation failed",
          );
        }
      } else {
        try {
          const response = await generateResponse.mutateAsync({
            message,
            language,
          });
          const tempAssistantMsg: ChatMessage = {
            id: BigInt(Date.now() + 1),
            content: response,
            role: "assistant",
            language,
            timestamp: BigInt((Date.now() + 1) * 1_000_000),
          };
          setLocalMessages((prev) => {
            const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
            return [...withoutTemp, tempUserMsg, tempAssistantMsg];
          });
        } catch {
          setLocalMessages((prev) =>
            prev.filter((m) => m.id !== tempUserMsg.id),
          );
          toast.error(
            language === "od" ? "ଉତ୍ତର ଦେବାରେ ଭୁଲ" : "Failed to get response",
          );
        }
      }
    },
    [mode, language, generateImage, generateResponse],
  );

  const handleClearHistory = useCallback(async () => {
    try {
      await clearHistory.mutateAsync();
      setLocalMessages([]);
      toast.success(language === "od" ? "ଚ୍ୟାଟ ସଫା ହେଲା" : "Chat cleared");
    } catch {
      toast.error(language === "od" ? "ସଫା ବିଫଳ" : "Failed to clear");
    }
  }, [clearHistory, language]);

  const isLoading = generateResponse.isPending || generateImage.isPending;
  const hasMessages = localMessages.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background eco-grid">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isDark={isDark}
        language={language}
        isMobileOpen={isMobileSidebarOpen}
        onNewChat={handleNewChat}
        onSelectSession={setActiveSessionId}
        onDeleteSession={handleDeleteSession}
        onToggleDark={() => setIsDark((d) => !d)}
        onLanguageChange={setLanguage}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCreatingSession={createSession.isPending}
      />

      {/* Main area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-muted-foreground"
              onClick={() => setIsMobileSidebarOpen(true)}
              data-ocid="sidebar.toggle_button"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <img
                src="/assets/generated/shristiai-logo-transparent.dim_200x200.png"
                alt="ShristiAI"
                className="w-7 h-7 object-contain"
              />
              <div>
                <h1 className="font-display font-bold text-sm leading-none text-foreground">
                  ShristiAI
                </h1>
                <p className="text-[10px] text-muted-foreground">
                  Sai AI Services
                </p>
              </div>
            </div>

            {/* Mode badge */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                mode === "image"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {mode === "image" ? "🎨" : "💬"}{" "}
              {mode === "image"
                ? language === "od"
                  ? "ଚିତ୍ର ମୋଡ"
                  : "Image Mode"
                : language === "od"
                  ? "ଚ୍ୟାଟ ମୋଡ"
                  : "Chat Mode"}
            </span>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            {hasMessages && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={handleClearHistory}
                disabled={clearHistory.isPending}
                data-ocid="chat.clear_button"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {language === "od" ? "ସଫା" : "Clear"}
                </span>
              </Button>
            )}
            <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted font-mono">
              {language === "en" ? "EN" : "ଓଡ଼"}
            </span>
          </div>
        </header>

        {/* Error state */}
        {(historyError || sessionsError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-3 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
            data-ocid="chat.error_state"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>
              {language === "od"
                ? "ସଂଯୋଗ ত୍ରୁଟି। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।"
                : "Connection error. Please try again."}
            </span>
          </motion.div>
        )}

        {/* Messages area */}
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 custom-scrollbar overflow-hidden"
        >
          <div className="px-4 md:px-6 py-4 max-w-3xl mx-auto w-full">
            {!hasMessages ? (
              <WelcomeScreen
                language={language}
                onSuggestion={(text) => {
                  // Detect if it's an image prompt
                  if (
                    text.toLowerCase().includes("generate") ||
                    text.toLowerCase().includes("ଚିତ୍ର") ||
                    text.toLowerCase().includes("image")
                  ) {
                    setMode("image");
                  } else {
                    setMode("chat");
                  }
                  setPrefillText(text);
                }}
              />
            ) : (
              <div className="space-y-6 pb-4">
                <AnimatePresence initial={false}>
                  {localMessages.map((msg, idx) => (
                    <MessageBubble
                      key={msg.id.toString()}
                      message={msg}
                      index={idx}
                      speakingId={speakingId}
                      onSpeak={speak}
                    />
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isLoading && <TypingIndicator />}
                </AnimatePresence>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput
              mode={mode}
              language={language}
              isLoading={isLoading}
              onSend={handleSend}
              onModeChange={setMode}
              prefillText={prefillText}
              onPrefillConsumed={() => setPrefillText(undefined)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
