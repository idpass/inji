import React, { useContext } from 'react';
import AppLoading from 'expo-app-loading';
import { AppLayout } from './screens/AppLayout';
import { useFont } from './shared/hooks/useFont';
import { GlobalContextProvider } from './components/GlobalContextProvider';
import { GlobalContext } from './shared/GlobalContext';
import { useSelector } from '@xstate/react';
import { selectIsReady } from './machines/app';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const AppInitialization: React.FC = () => {
  const { appService } = useContext(GlobalContext);
  const hasFontsLoaded = useFont();
  const isReady = useSelector(appService, selectIsReady);

  return isReady && hasFontsLoaded ? <AppLayout /> : <AppLoading />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GlobalContextProvider>
        <AppInitialization />
      </GlobalContextProvider>
    </SafeAreaProvider>
  );
}
