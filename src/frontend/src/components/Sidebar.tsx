import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Leaf, MessageSquare, Moon, Plus, Sun, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { ConversationSession } from "../backend.d";

interface SidebarProps {
  sessions: ConversationSession[];
  activeSessionId: bigint | null;
  isDark: boolean;
  language: "en" | "od";
  isMobileOpen: boolean;
  onNewChat: () => void;
  onSelectSession: (id: bigint) => void;
  onDeleteSession: (id: bigint) => void;
  onToggleDark: () => void;
  onLanguageChange: (lang: "en" | "od") => void;
  onCloseMobile: () => void;
  isCreatingSession: boolean;
}

export function Sidebar({
  sessions,
  activeSessionId,
  isDark,
  language,
  isMobileOpen,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onToggleDark,
  onLanguageChange,
  onCloseMobile,
  isCreatingSession,
}: SidebarProps) {
  // Close sidebar on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) onCloseMobile();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMobileOpen, onCloseMobile]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="p-4 pt-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/assets/generated/shristiai-logo-transparent.dim_200x200.png"
                alt="ShristiAI"
                className="w-9 h-9 object-contain animate-float"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-sidebar" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base leading-tight text-sidebar-foreground glow-text">
                ShristiAI
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                Sai AI Services
              </p>
            </div>
          </div>
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onCloseMobile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat */}
        <Button
          className="w-full gap-2 font-medium bg-primary/90 hover:bg-primary text-primary-foreground shadow-glow transition-all duration-200 hover:shadow-glow-dark"
          onClick={onNewChat}
          disabled={isCreatingSession}
          data-ocid="nav.new_chat_button"
        >
          <Plus className="h-4 w-4" />
          {language === "od" ? "ନୂଆ ଚ୍ୟାଟ" : "New Chat"}
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Sessions list */}
      <ScrollArea className="flex-1 px-2 py-2 custom-scrollbar">
        <div className="space-y-0.5">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm px-4">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>
                {language === "od" ? "କୌଣସି ଚ୍ୟାଟ ନାହିଁ" : "No conversations yet"}
              </p>
            </div>
          ) : (
            sessions.map((session, idx) => (
              <motion.div
                key={session.id.toString()}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative flex items-center"
                data-ocid={`sidebar.session.item.${idx + 1}`}
              >
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className={`flex-1 text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 truncate pr-8
                    ${
                      activeSessionId === session.id
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                >
                  <MessageSquare className="inline h-3.5 w-3.5 mr-2 opacity-60 flex-shrink-0" />
                  <span className="truncate">{session.name}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  data-ocid={`sidebar.session.delete_button.${idx + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      {/* Controls */}
      <div className="p-3 space-y-2">
        {/* Language toggle */}
        <div
          className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg"
          data-ocid="nav.language_select"
        >
          <button
            type="button"
            onClick={() => onLanguageChange("en")}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              language === "en"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange("od")}
            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
              language === "od"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ଓଡ଼
          </button>
        </div>

        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={onToggleDark}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-150"
          data-ocid="nav.dark_mode_toggle"
        >
          <div className="relative">
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-4 w-4 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-4 w-4 text-slate-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span>
            {isDark
              ? language === "od"
                ? "ଆଲୋକ ମୋଡ"
                : "Light Mode"
              : language === "od"
                ? "ଅନ୍ଧାର ମୋଡ"
                : "Dark Mode"}
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Leaf className="h-3 w-3 text-emerald-500" />
          <span className="font-medium">ShristiAI by Sai AI Services</span>
        </div>
        <p className="text-[9px] text-muted-foreground/50 mt-0.5">
          © {new Date().getFullYear()}. Built with{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r border-border h-full flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 md:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
