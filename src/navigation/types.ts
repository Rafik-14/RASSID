import type { OperationType } from '@/types';

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  StoreProfile: { storeId: string };
  StoreHistory: { storeId: string };
  NewOperation: { storeId?: string; type?: OperationType };
  NewStore: undefined;
  EditStore: { storeId: string };
  OverdueAlerts: undefined;
  AuthLock: { reason: string };
  ProfileEdit: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Deliveries: undefined;
  Payments: undefined;
  Stores: undefined;
};
