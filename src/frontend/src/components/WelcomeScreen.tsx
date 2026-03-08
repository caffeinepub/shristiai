import { BookOpen, Image, Lightbulb, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface WelcomeScreenProps {
  language: "en" | "od";
  onSuggestion: (text: string) => void;
}

const suggestions = {
  en: [
    { icon: BookOpen, text: "Help me study for my exam", label: "Study Help" },
    {
      icon: Image,
      text: "Generate a futuristic smart city in Odisha with flying cars",
      label: "Generate Image",
    },
    {
      icon: Lightbulb,
      text: "Give me a business idea for a startup in Odisha",
      label: "Business Idea",
    },
  ],
  od: [
    { icon: BookOpen, text: "ମୋ ପରୀକ୍ଷା ପ୍ରସ୍ତୁତି ରେ ସାହାଯ୍ୟ କର", label: "ଅଧ୍ୟୟନ ସାହାଯ୍ୟ" },
    { icon: Image, text: "ଓଡ଼ିଶାରେ ଏକ ଭବିଷ୍ୟ ସ୍ମାର୍ଟ ସହର ତିଆରି କର", label: "ଚିତ୍ର ତୈୟାର" },
    { icon: Lightbulb, text: "ଓଡ଼ିଶାରେ ଏକ ବ୍ୟବସାୟ ଧାରଣା ଦିଅ", label: "ବ୍ୟବସାୟ ଧାରଣା" },
  ],
};

export function WelcomeScreen({ language, onSuggestion }: WelcomeScreenProps) {
  const tips = suggestions[language];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center h-full px-4 py-12"
      data-ocid="chat.empty_state"
    >
      {/* Logo + name */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="relative mb-4">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-glow dark:shadow-glow-dark">
            <img
              src="/assets/generated/shristiai-logo-transparent.dim_200x200.png"
              alt="ShristiAI"
              className="w-14 h-14 object-contain animate-float"
            />
          </div>
          {/* Orbiting dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-3xl"
            style={{ transformOrigin: "center" }}
          >
            <div className="absolute -top-1 left-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 -translate-x-1/2 shadow-lg" />
          </motion.div>
        </div>

        <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground text-center mb-2">
          {language === "od" ? (
            <>
              ନମସ୍କାର! ମୁଁ <span className="text-primary glow-text">ShristiAI</span>
            </>
          ) : (
            <>
              Hello! I'm{" "}
              <span className="text-primary glow-text">ShristiAI</span>
            </>
          )}
        </h2>

        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            {language === "od"
              ? "ଆପଣଙ୍କ ସ୍ମାର୍ଟ ବହୁଭାଷୀ AI ସହାୟକ"
              : "Your Smart Multilingual AI Assistant"}
          </p>
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          {language === "od"
            ? "ଓଡ଼ିଆ ଓ ଇଂରାଜୀ — ଚ୍ୟାଟ, ଚିତ୍ର, ଏବଂ ଆହୁରି ଅଧିକ"
            : "Powered by Sai AI Services — Chat, Images, Voice & more"}
        </p>
      </motion.div>

      {/* Capability badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-2 mb-8"
      >
        {[
          language === "od" ? "💬 ଚ୍ୟାଟ" : "💬 Smart Chat",
          language === "od" ? "🎨 ଚିତ୍ର" : "🎨 Image Gen",
          language === "od" ? "🔊 ସ୍ୱର" : "🔊 Voice TTS",
          language === "od" ? "🌐 ଦ୍ୱିଭାଷୀ" : "🌐 Bilingual",
        ].map((cap) => (
          <span
            key={cap}
            className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium"
          >
            {cap}
          </span>
        ))}
      </motion.div>

      {/* Suggestion chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-lg space-y-2"
      >
        <p className="text-center text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
          {language === "od" ? "ଆଜି ଚେଷ୍ଟା କରନ୍ତୁ" : "Try asking"}
        </p>
        {tips.map((tip, i) => (
          <motion.button
            key={tip.label}
            type="button"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.1 }}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestion(tip.text)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-left group shadow-xs"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
              <tip.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                {tip.label}
              </p>
              <p className="text-sm text-foreground">{tip.text}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
