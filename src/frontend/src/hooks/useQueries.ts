import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage, ConversationSession } from "../backend.d";
import { useActor } from "./useActor";

export function useGetHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["history"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListSessions() {
  const { actor, isFetching } = useActor();
  return useQuery<ConversationSession[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateResponse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      message,
      language,
    }: {
      message: string;
      language: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const [response] = await Promise.all([
        actor.generateResponse(message, language),
      ]);
      await Promise.all([
        actor.addMessage("user", message, null, language),
        actor.addMessage("assistant", response, null, language),
      ]);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useGenerateImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      prompt,
      language,
    }: {
      prompt: string;
      language: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const metadata = await actor.getImageMetadata(prompt);
      // Generate canvas-based image from metadata
      const dataUrl = generateCanvasImage(prompt, metadata);
      await Promise.all([
        actor.addMessage("user", prompt, null, language),
        actor.addMessage(
          "assistant",
          `Generated image for: ${prompt}`,
          dataUrl,
          language,
        ),
      ]);
      return { metadata, dataUrl, prompt };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useClearHistory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.clearHistory();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}

export function useCreateSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createSession(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useDeleteSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteSession(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// ─── Canvas image generator ───────────────────────────────────────
function generateCanvasImage(prompt: string, _metadata: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Parse colors from prompt (basic heuristic)
  const colorMap: Record<string, string[]> = {
    sunset: ["#FF6B35", "#F7C59F", "#EFEFD0"],
    ocean: ["#006994", "#48CAE4", "#90E0EF"],
    forest: ["#2D6A4F", "#52B788", "#B7E4C7"],
    city: ["#2C3E50", "#3498DB", "#ECF0F1"],
    futuristic: ["#0D1B2A", "#1E6091", "#48CAE4"],
    space: ["#0A0A2A", "#1A237E", "#7C4DFF"],
    nature: ["#1B4332", "#40916C", "#95D5B2"],
    sky: ["#023E8A", "#0096C7", "#90E0EF"],
    fire: ["#D62828", "#F77F00", "#FCBF49"],
    mountain: ["#495057", "#868E96", "#DEE2E6"],
  };

  let colors = ["#0D3B4A", "#1A6B8A", "#2DC5D0", "#7AECF5"];
  const promptLower = prompt.toLowerCase();
  for (const [key, vals] of Object.entries(colorMap)) {
    if (promptLower.includes(key)) {
      colors = vals;
      break;
    }
  }

  // Draw gradient background
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, colors[0] || "#0D3B4A");
  grad.addColorStop(0.5, colors[1] || "#1A6B8A");
  grad.addColorStop(1, colors[2] || "#2DC5D0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add grid pattern
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw decorative circles
  const accent = colors[3] || colors[2] || "#7AECF5";
  ctx.strokeStyle = `${accent}40`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(
      canvas.width * (0.3 + i * 0.2),
      canvas.height * 0.5,
      30 + i * 20,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Glowing center orb
  const orbGrad = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    80,
  );
  orbGrad.addColorStop(0, `${accent}60`);
  orbGrad.addColorStop(1, "transparent");
  ctx.fillStyle = orbGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // "AI Generated" badge
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.roundRect(16, 16, 140, 32, 16);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 12px system-ui";
  ctx.fillText("✦ AI GENERATED", 28, 37);

  // Prompt text (wrapped)
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "bold 18px system-ui";
  ctx.textAlign = "center";

  const words = prompt.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > canvas.width - 60) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
    if (lines.length >= 3) break;
  }
  if (currentLine && lines.length < 3) lines.push(currentLine);

  const textY = canvas.height / 2 - ((lines.length - 1) * 28) / 2;
  lines.forEach((line, idx) => {
    ctx.fillText(line, canvas.width / 2, textY + idx * 28);
  });

  // Bottom label
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "11px system-ui";
  ctx.fillText(
    "ShristiAI · Sai AI Services",
    canvas.width / 2,
    canvas.height - 16,
  );

  return canvas.toDataURL("image/png");
}
