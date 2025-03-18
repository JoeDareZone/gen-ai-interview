import { useFirestore } from '@/context/FirestoreContext'
import React, { useEffect, useState } from 'react'
import { Button, FlatList, SafeAreaView, Text } from 'react-native'

export default function ExploreScreen() {
	const { getCollection, addDocument } = useFirestore()
	const [data, setData] = useState<any[]>([])

	useEffect(() => {
		;(async () => {
			const fetchedData = await getCollection('demo')
			setData(fetchedData)
		})()
	}, [])

	return (
		<SafeAreaView className='flex-1 p-4'>
			<FlatList
				data={data}
				keyExtractor={item => item.id}
				renderItem={({ item }) => <Text>{JSON.stringify(item)}</Text>}
			/>
			<Button
				title='Add Document'
				onPress={() =>
					addDocument('demo', { name: 'John Doe' })
				}
			/>
		</SafeAreaView>
	)
}
