import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface BulletPoint {
  explanation: string;
  output: string;
}

interface AIResponseProps {
  response: string;
  bulletPoints?: BulletPoint[];
  imageUrl?: string;
  onExplainBullet?: (bullet: BulletPoint) => void;
}

export default function AIResponse({
  response,
  bulletPoints,
  imageUrl,
  onExplainBullet,
}: AIResponseProps) {
  return (
    <View style={styles.container}>
      {response.length > 0 && (
        <Text style={styles.responseText}>{response}</Text>
      )}
      {bulletPoints && bulletPoints.length > 0 && (
        <View style={styles.bulletContainer}>
          {bulletPoints.map((bp, index) => (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bulletText}>
                • {bp.explanation}: {bp.output}
              </Text>
              <TouchableOpacity
                style={styles.explainButton}
                onPress={() => onExplainBullet && onExplainBullet(bp)}
              >
                <Text style={styles.explainButtonText}>Explain</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  responseText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  bulletContainer: {
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  bulletText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  explainButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  explainButtonText: {
    fontSize: 12,
    color: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 4,
  },
});
