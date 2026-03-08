import { motion } from "motion/react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-start gap-3"
      data-ocid="chat.loading_state"
    >
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center overflow-hidden">
        <img
          src="/assets/generated/shristiai-logo-transparent.dim_200x200.png"
          alt="ShristiAI"
          className="w-6 h-6 object-contain"
        />
      </div>

      <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm dark:bg-card/80 dark:backdrop-blur-sm">
        <div className="flex items-center gap-1.5 h-5">
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
          <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
        </div>
      </div>
    </motion.div>
  );
}
