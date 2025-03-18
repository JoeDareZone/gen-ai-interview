// types/chat.ts
export interface ChatMessage {
	text: string
	role: 'user' | 'AI'
	timestamp?: string
}

export interface UseChatFirebaseReturn {
	chatMessages: ChatMessage[]
	isLoading: boolean
	error: string | null
	fetchMessages: () => Promise<void>
	sendMessage: (prompt: string) => Promise<void>
}
