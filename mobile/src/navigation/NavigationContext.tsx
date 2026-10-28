import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { MainTab, ScreenName, ScreenParamsMap, StackEntry } from '../types';

interface NavigationContextType {
  currentTab: MainTab;
  stack: StackEntry[];
  currentScreen: StackEntry;
  navigate: <K extends ScreenName>(name: K, params?: ScreenParamsMap[K]) => void;
  goBack: () => void;
  switchTab: (tab: MainTab) => void;
  resetToMain: (tab?: MainTab) => void;
}

const NavigationContext = createContext<NavigationContextType>({} as NavigationContextType);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<MainTab>('Radar');
  const [stack, setStack] = useState<StackEntry[]>([{ name: 'MainTabs', params: undefined }]);

  const currentScreen = stack[stack.length - 1];

  const navigate = useCallback(<K extends ScreenName>(name: K, params?: ScreenParamsMap[K]) => {
    if (name === 'MainTabs') {
      const tabParam = (params as { tab?: MainTab } | undefined)?.tab;
      if (tabParam) setCurrentTab(tabParam);
      setStack([{ name: 'MainTabs', params: undefined }]);
      return;
    }
    setStack((prev) => [...prev, { name, params: params as ScreenParamsMap[K] }]);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const switchTab = useCallback((tab: MainTab) => {
    setCurrentTab(tab);
    setStack([{ name: 'MainTabs', params: undefined }]);
  }, []);

  const resetToMain = useCallback((tab: MainTab = 'Radar') => {
    setCurrentTab(tab);
    setStack([{ name: 'MainTabs', params: undefined }]);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, goBack]);

  return (
    <NavigationContext.Provider
      value={{
        currentTab,
        stack,
        currentScreen,
        navigate,
        goBack,
        switchTab,
        resetToMain,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
