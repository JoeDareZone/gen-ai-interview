import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export interface BulletPoint {
	heading: string
	explanation: string
	output: string
}

interface CollapsibleBulletProps {
	bullet: BulletPoint
	onExplainBullet?: (bullet: BulletPoint) => void
}

export function CollapsibleBullet({
	bullet,
	onExplainBullet,
}: CollapsibleBulletProps) {
	const [collapsed, setCollapsed] = useState(true)

	return (
		<View className='items-center my-1'>
			{/* Heading with chevron */}
			<TouchableOpacity
				onPress={() => setCollapsed(!collapsed)}
				className='flex-row items-center pb-4'
			>
				<Text className='text-base font-semibold text-gray-800'>
					{bullet.heading}
				</Text>
				<Ionicons
					name='chevron-down'
					size={18}
					color='#333'
					style={{
						transform: [{ rotate: collapsed ? '0deg' : '180deg' }],
						marginLeft: 4,
					}}
				/>
			</TouchableOpacity>
			{/* Show details only when expanded */}
			{!collapsed && (
				<>
					<View className='flex-1 ml-2 pb-4'>
						<Text className='text-sm text-gray-600'>
							{bullet.explanation}: {bullet.output}
						</Text>
					</View>
					<TouchableOpacity
						onPress={() =>
							onExplainBullet && onExplainBullet(bullet)
						}
						className='bg-purple-700 px-4 py-2 rounded-lg ml-2 mb-4'
					>
						<Text className='text-xs font-bold text-white'>
							Explain Further
						</Text>
					</TouchableOpacity>
				</>
			)}
		</View>
	)
}
