import React from 'react'
import { Image, Text, View } from 'react-native'
import { BulletPoint, CollapsibleBullet } from './CollapsibleBullet'
interface AIResponseProps {
	response: string
	bulletPoints?: BulletPoint[]
	imageUrl?: string
	onExplainBullet?: (bullet: BulletPoint) => void
}

export default function AIResponse({
	response,
	bulletPoints,
	imageUrl,
	onExplainBullet,
}: AIResponseProps) {
	return (
		<View className='my-2 mx-4 p-4 bg-white rounded-lg shadow'>
			{imageUrl && (
				<Image
					source={{ uri: imageUrl }}
					className='w-full h-48 rounded mb-4'
					resizeMode='contain'
					style={{
						width: '100%',
						height: 192,
						objectFit: 'contain',
					}}
				/>
			)}
			{response.length > 0 && (
				<Text className='text-base text-gray-800 mb-4 leading-6'>
					{response}
				</Text>
			)}
			{bulletPoints && bulletPoints.length > 0 && (
				<View className='mt-2 mb-2'>
					{bulletPoints.map((bp, index) => (
						<CollapsibleBullet
							key={index}
							bullet={bp}
							onExplainBullet={onExplainBullet}
						/>
					))}
				</View>
			)}
		</View>
	)
}
