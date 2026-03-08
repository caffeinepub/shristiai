import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Loader2, MessageSquare, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

export type ChatMode = "chat" | "image";

interface ChatInputProps {
  mode: ChatMode;
  language: "en" | "od";
  isLoading: boolean;
  onSend: (message: string) => void;
  onModeChange: (mode: ChatMode) => void;
  prefillText?: string;
  onPrefillConsumed?: () => void;
}

export function ChatInput({
  mode,
  language,
  isLoading,
  onSend,
  onModeChange,
  prefillText,
  onPrefillConsumed,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle prefill from suggestion chips
  useEffect(() => {
    if (prefillText) {
      setInput(prefillText);
      textareaRef.current?.focus();
      onPrefillConsumed?.();
    }
  }, [prefillText, onPrefillConsumed]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isLoading, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const placeholder =
    mode === "image"
      ? language === "od"
        ? "ଏକ ଚିତ୍ର ପ୍ରମ୍ପ୍ଟ ଲେଖନ୍ତୁ..."
        : "Describe an image to generate..."
      : language === "od"
        ? "ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ..."
        : "Ask ShristiAI anything...";

  return (
    <div className="p-3 md:p-4">
      {/* Mode indicator */}
      <AnimatePresence mode="wait">
        {mode === "image" && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex items-center gap-1.5 mb-2 px-1"
          >
            <Image className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-primary font-medium">
              {language === "od" ? "ଚିତ୍ର ଉତ୍ପାଦନ ମୋଡ" : "Image Generation Mode"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl px-3 py-2.5 shadow-sm input-glow transition-all duration-200 focus-within:border-primary/50">
        {/* Mode toggle */}
        <button
          type="button"
          onClick={() => onModeChange(mode === "chat" ? "image" : "chat")}
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
            mode === "image"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
          title={
            mode === "chat" ? "Switch to Image Mode" : "Switch to Chat Mode"
          }
          data-ocid="chat.mode_toggle"
        >
          {mode === "image" ? (
            <Image className="h-4 w-4" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
        </button>

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground py-1.5 min-h-[36px] max-h-[160px] leading-relaxed"
          disabled={isLoading}
          data-ocid="chat.input"
        />

        {/* Send button */}
        <Button
          size="icon"
          className={`flex-shrink-0 w-8 h-8 rounded-xl transition-all duration-200 ${
            !input.trim() || isLoading
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow dark:shadow-glow-dark"
          }`}
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          data-ocid="chat.send_button"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        {language === "od"
          ? "ShristiAI ଭୁଲ ହୋଇ ପାରେ। ଗୁରୁତ୍ୱପୂର୍ଣ ତଥ୍ୟ ଯାଞ୍ଚ କରନ୍ତୁ।"
          : "ShristiAI can make mistakes. Verify important information."}
      </p>
    </div>
  );
}
