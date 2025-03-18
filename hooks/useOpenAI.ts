import OpenAI from 'openai'
import { useState } from 'react'

interface UseOpenAIOptions {
	model?: string
	maxTokens?: number
	temperature?: number
}

interface UseOpenAIResult {
	completion: string | null
	isLoading: boolean
	error: Error | null
	generateCompletion: (prompt: string) => Promise<void>
}

export function useOpenAI(options: UseOpenAIOptions = {}): UseOpenAIResult {
	const [completion, setCompletion] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const client = new OpenAI({
		apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
	})

	const generateCompletion = async (prompt: string) => {
		console.log('Generating completion...')
		try {
			setIsLoading(true)
			setError(null)

			const response = await client.chat.completions.create({
				model: options.model || 'gpt-4',
				messages: [
					{
						role: 'user',
						content: prompt,
					},
				],
				max_tokens: options.maxTokens || 1000,
				temperature: options.temperature || 0.7,
			})

			console.log(response.choices[0].message.content)

			setCompletion(response.choices[0].message.content)
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error('An error occurred')
			)
		} finally {
			setIsLoading(false)
		}
	}

	return {
		completion,
		isLoading,
		error,
		generateCompletion,
	}
}
