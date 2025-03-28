import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const theme = {
  ...eva.light,
  colors: {
    ...eva.light.colors,
    primary: '#0086FF',
    danger: '#FF5E70',
    success: '#0086FF',
    info: '#0086FF',
  },
};

export default function App() {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <SafeAreaProvider>
        <ApplicationProvider {...eva} theme={theme}>
          <AppNavigator />
        </ApplicationProvider>
      </SafeAreaProvider>
    </>
  );
}
