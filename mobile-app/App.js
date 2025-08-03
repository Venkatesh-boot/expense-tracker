import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/app/HomeScreen';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen />
    </SafeAreaView>
  );
}
