import openai from "openai"
import { Message } from "openai/resources/beta/threads/messages"
import { useState } from "react"
const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const addMessage = (message: Message) => {
        setMessages([...messages, message])
    }

    const sendMessage = async (message: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: message }],
            })
        } catch (error) {
            setError(error as Error)
        } finally {
            setIsLoading(false)
        }
    }
}

export default useChat