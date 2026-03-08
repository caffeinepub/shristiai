import { useCallback, useRef, useState } from "react";

export function useTTS() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string, language: string, id: string) => {
      if (!window.speechSynthesis) return;

      // Stop if same message is playing
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }

      // Stop current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Language mapping
      if (language === "od") {
        // Odia: use hi-IN as closest available, or en-IN
        utterance.lang = "hi-IN";
        utterance.rate = 0.85;
      } else {
        utterance.lang = "en-US";
        utterance.rate = 1.0;
      }

      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [speakingId],
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  }, []);

  return { speak, stop, speakingId };
}
