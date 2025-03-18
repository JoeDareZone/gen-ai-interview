// MicButton.tsx
import React, { useEffect, useRef } from 'react'
import { Animated, TouchableOpacity } from 'react-native'
import { IconSymbol } from './IconSymbol.ios'

interface MicButtonProps {
	isListening: boolean
	onPress: () => void
}

export default function MicButton({ isListening, onPress }: MicButtonProps) {
	const scaleAnim = useRef(new Animated.Value(1)).current

	useEffect(() => {
		if (isListening) {
			Animated.loop(
				Animated.sequence([
					Animated.timing(scaleAnim, {
						toValue: 1.2,
						duration: 500,
						useNativeDriver: true,
					}),
					Animated.timing(scaleAnim, {
						toValue: 1,
						duration: 500,
						useNativeDriver: true,
					}),
				])
			).start()
		} else {
			scaleAnim.setValue(1)
		}
	}, [isListening])

	return (
		<TouchableOpacity onPress={onPress}>
			<Animated.View
				style={{
					transform: [{ scale: scaleAnim }],
					backgroundColor: '#eee',
					padding: 20,
					borderRadius: 50,
				}}
			>
				<IconSymbol
					name={isListening ? 'mic.fill' : 'mic'}
					size={24}
					color={isListening ? 'red' : 'black'}
				/>

			</Animated.View>
		</TouchableOpacity>
	)
}
