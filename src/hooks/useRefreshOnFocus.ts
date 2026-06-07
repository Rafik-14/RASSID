import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/** Reload data when screen gains focus */
export function useRefreshOnFocus(refresh: () => void | Promise<void>, deps: unknown[] = []) {
  useFocusEffect(
    useCallback(() => {
      void refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
  );
}
