import { Button } from "@/components/ui/button";
import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import type { ChatMessage } from "../backend.d";

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  speakingId: string | null;
  onSpeak: (text: string, language: string, id: string) => void;
}

export function MessageBubble({
  message,
  index,
  speakingId,
  onSpeak,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const messageId = message.id.toString();
  const isSpeaking = speakingId === messageId;
  const markerIndex = (index + 1).toString();

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="flex justify-end"
        data-ocid={`chat.message.item.${markerIndex}`}
      >
        <div className="max-w-[75%] md:max-w-[60%]">
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm">
            <p className="text-sm leading-relaxed break-words">
              {message.content}
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right pr-1">
            {formatTimestamp(message.timestamp)}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="flex items-start gap-3"
      data-ocid={`chat.message.item.${markerIndex}`}
    >
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center overflow-hidden">
        <img
          src="/assets/generated/shristiai-logo-transparent.dim_200x200.png"
          alt="ShristiAI"
          className="w-6 h-6 object-contain"
        />
      </div>

      <div className="flex-1 max-w-[75%] md:max-w-[70%]">
        {/* Name */}
        <p className="text-[10px] font-semibold text-primary mb-1 flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5" />
          ShristiAI
        </p>

        {/* Image message */}
        {message.imageUrl ? (
          <div className="rounded-2xl rounded-tl-sm overflow-hidden shadow-lg border border-border">
            <img
              src={message.imageUrl}
              alt="AI Generated"
              className="w-full max-w-sm object-cover"
            />
            <div className="px-3 py-2 bg-card text-xs text-muted-foreground">
              {message.content}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm dark:bg-card/80 dark:backdrop-blur-sm">
            <p className="text-sm leading-relaxed break-words text-card-foreground whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}

        {/* Footer: timestamp + TTS */}
        <div className="flex items-center gap-2 mt-1 pl-1">
          <p className="text-[10px] text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </p>
          {!message.imageUrl && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 rounded-full transition-all duration-200 ${
                isSpeaking
                  ? "text-primary bg-primary/15 hover:bg-primary/25"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
              onClick={() =>
                onSpeak(message.content, message.language, messageId)
              }
              title={isSpeaking ? "Stop speaking" : "Read aloud"}
              data-ocid={`chat.tts_button.${markerIndex}`}
            >
              {isSpeaking ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function formatTimestamp(ts: bigint): string {
  try {
    // timestamp is in nanoseconds from IC
    const ms = Number(ts) / 1_000_000;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
