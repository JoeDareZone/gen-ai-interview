export interface ChatMessage {
	role: 'user' | 'AI'
	text: string
	imageUrl?: string
	timestamp?: string
	bulletPoints?: Array<{ heading: string; explanation: string; output: string }>
}

export interface UseChatFirebaseReturn {
	chatMessages: ChatMessage[]
	isLoading: boolean
	error: string | null
	fetchMessages: () => Promise<void>
	sendMessage: (prompt: string) => Promise<void>
}

export interface UseChatConversationOptions {
	model?: string
	maxTokens?: number
	temperature?: number
	studentProfile?: {
		grade: string
		aiPersonality: string
	}
}

export interface UseChatConversationResult {
	messages: ChatMessage[]
	isLoading: boolean
	error: Error | null
	sendMessage: (
		prompt: string,
		type?: 'bulletPoints' | 'explainFurther'
	) => Promise<ChatMessage>
}
