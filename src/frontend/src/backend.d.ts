import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    id: bigint;
    content: string;
    role: string;
    language: string;
    imageUrl?: string;
    timestamp: bigint;
}
export interface ConversationSession {
    id: bigint;
    name: string;
    createdAt: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMessage(_role: string, _content: string, _imageUrl: string | null, _language: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearHistory(): Promise<void>;
    createSession(_name: string): Promise<bigint>;
    deleteSession(id: bigint): Promise<boolean>;
    generateResponse(userMessage: string, _language: string): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getHistory(): Promise<Array<ChatMessage>>;
    getImageMetadata(_prompt: string): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    listSessions(): Promise<Array<ConversationSession>>;
}
