import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './src/theme';
import { AuthProvider, AppConfigProvider, ActivePetProvider, NotificationProvider } from './src/context';
import { I18nProvider } from './src/i18n';
import { NavigationProvider } from './src/navigation/NavigationContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppConfigProvider>
        <AuthProvider>
          <I18nProvider>
            <ActivePetProvider>
              <NotificationProvider>
                <NavigationProvider>
                  <SafeAreaView style={styles.safeArea}>
                    <StatusBar style="dark" />
                    <RootNavigator />
                  </SafeAreaView>
                </NavigationProvider>
              </NotificationProvider>
            </ActivePetProvider>
          </I18nProvider>
        </AuthProvider>
      </AppConfigProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
});
