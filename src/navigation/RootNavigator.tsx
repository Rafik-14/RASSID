import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/config/theme';
import type { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { StoreProfileScreen } from '@/screens/StoreProfileScreen';
import { StoreHistoryScreen } from '@/screens/StoreHistoryScreen';
import { NewOperationScreen } from '@/screens/NewOperationScreen';
import { NewStoreScreen } from '@/screens/NewStoreScreen';
import { EditStoreScreen } from '@/screens/EditStoreScreen';
import { OverdueAlertsScreen } from '@/screens/OverdueAlertsScreen';
import { AuthLockScreen } from '@/screens/AuthLockScreen';
import { ProfileEditScreen } from '@/screens/ProfileEditScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
        animation: 'fade', // matching modern prototype subtle fade
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="StoreProfile" component={StoreProfileScreen} />
      <Stack.Screen name="StoreHistory" component={StoreHistoryScreen} />
      <Stack.Screen name="NewOperation" component={NewOperationScreen} />
      <Stack.Screen name="NewStore" component={NewStoreScreen} />
      <Stack.Screen name="EditStore" component={EditStoreScreen} />
      <Stack.Screen name="OverdueAlerts" component={OverdueAlertsScreen} />
      <Stack.Screen name="AuthLock" component={AuthLockScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
    </Stack.Navigator>
  );
}
