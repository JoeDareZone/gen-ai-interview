import Voice, {
	SpeechErrorEvent,
	SpeechResultsEvent,
} from '@react-native-voice/voice'
import { useEffect, useState } from 'react'

export function useSpeechToText() {
	const [isListening, setIsListening] = useState(false)
	const [transcript, setTranscript] = useState('')
	const [error, setError] = useState<string | null>(null)

	// Event handler for speech results
	const onSpeechResults = (e: SpeechResultsEvent) => {
		if (e.value && e.value.length > 0) {
			setTranscript(e.value[0]) // Take the first result
		}
	}

	// Event handler for speech errors
	const onSpeechError = (e: SpeechErrorEvent) => {
		console.error('Speech recognition error:', e)
		setError(e.error?.message || 'An unknown error occurred')
		setIsListening(false)
	}

	useEffect(() => {
		// Attach event listeners
		Voice.onSpeechResults = onSpeechResults
		Voice.onSpeechError = onSpeechError

		// Cleanup the listeners on unmount
		return () => {
			Voice.destroy().then(Voice.removeAllListeners)
		}
	}, [])

	const startListening = async () => {
		setTranscript('')
		setError(null)
		setIsListening(true)
		try {
			await Voice.start('en-US') // Use desired language code
		} catch (err) {
			console.error('Error starting voice recognition:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Error starting voice recognition'
			)
			setIsListening(false)
		}
	}

	const stopListening = async () => {
		try {
			await Voice.stop()
			setIsListening(false)
		} catch (err) {
			console.error('Error stopping voice recognition:', err)
			setError(
				err instanceof Error
					? err.message
					: 'Error stopping voice recognition'
			)
		}
	}

	return { isListening, transcript, error, startListening, stopListening }
}
