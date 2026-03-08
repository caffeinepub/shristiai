# ShristiAI

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- ShristiAI chat assistant platform branded under "Sai AI Services"
- Multilingual support for English and Odia languages
- Chat interface with conversation history (stored in backend)
- AI text responses: simulated smart responses covering education, coding, business, general knowledge
- AI Image Generator: users type a prompt, the app generates and displays an AI-style image (using text-to-image simulation via canvas or placeholder generation with descriptive labels)
- Text-to-Speech (TTS): speaker button on each AI message that reads the response aloud using Web Speech API (supports Odia and English)
- Dark/light mode toggle
- Mobile-responsive layout
- Brand identity: ShristiAI name, Sai AI Services company, futuristic eco-friendly theme

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan

### Backend (Motoko)
- `ChatMessage` type: id, role (user/assistant), content, timestamp, imageUrl (optional)
- `Conversation` type: list of messages per session
- `addMessage(role, content, imageUrl)` -> stores message, returns message id
- `getHistory()` -> returns all messages in order
- `clearHistory()` -> clears all messages
- `generateResponse(userMessage, language)` -> returns a smart AI-generated text response based on keyword matching and context (education, coding, news, business, general knowledge, Odia/English detection)
- `generateImagePrompt(prompt)` -> returns metadata/description for image display (actual image rendering done on frontend via canvas/SVG with descriptive art)

### Frontend
- App shell: sidebar (chat history list) + main chat area
- Header: ShristiAI logo, company name, dark/light toggle, language selector (EN/OD)
- Chat area: scrollable message bubbles (user right, AI left), each AI bubble has speaker icon for TTS
- Input area: text field + send button + image generation mode toggle button
- Image generation: when user types an image prompt, display a generated visual placeholder with prompt-based descriptive art using canvas
- TTS: Web Speech API `speechSynthesis` with language code switching (en-US / or-IN)
- Dark/light mode: Tailwind dark class toggle, persisted to localStorage
- Conversation history: list of previous conversations in sidebar
- Mobile: hamburger menu for sidebar on small screens
- Welcome screen shown when no messages exist
