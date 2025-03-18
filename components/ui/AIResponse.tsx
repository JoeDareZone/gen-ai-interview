import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

interface AIResponseProps {
	response: string
	imageUrl?: string
}

export default function AIResponse({ response, imageUrl }: AIResponseProps) {
	return (
		<View className='my-2 mx-4'>
			{response.length > 0 && (
				<Text className='text-base text-gray-800'>{response}</Text>
			)}
			{imageUrl && (
				<Image
					className='w-full h-auto'
					source={{ uri: imageUrl }}
					style={styles.image}
					resizeMode='contain'
				/>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 8,
	},
	text: {
		fontSize: 16,
		color: '#333',
		marginBottom: 8,
	},
	image: {
		width: '100%',
		height: 200,
	},
})
