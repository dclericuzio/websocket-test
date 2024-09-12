import React, { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Client } from '@stomp/stompjs';

export default function HomeScreen() {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://103.183.74.176:8080/fgs',
      onConnect: (frame) => {
        console.log('STOMP Connected: ', frame);

        client.subscribe('/topic/price', (message) => {
          console.log('Message received from STOMP:', message.body);
          try {
            const messageData = JSON.parse(message.body);
            setPrice(messageData);
          } catch (err) {
            console.error('Error parsing STOMP message:', err);
            setError('Error receiving data');
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error: ', frame);
        setError('STOMP connection failed');
      },
      onWebSocketError: (event) => {
        console.error('WebSocket Error: ', event);
        setError('WebSocket connection failed');
      },
      onDisconnect: (frame) => {
        console.log('STOMP Disconnected: ', frame);
      },
    });

    client.activate();

    return () => {
      console.log('Disconnecting STOMP client');
      client.deactivate();
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.priceContainer}>
        {error ? (
          <ThemedText type="error">{error}</ThemedText>
        ) : (
          <ThemedText type="subtitle">
            {price !== null ? `Current Price: ${price}` : 'Fetching price...'}
          </ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceContainer: {
    marginTop: 20,
    padding: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
