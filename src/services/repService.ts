import * as SecureStore from 'expo-secure-store';
import { computeInitials } from '@/utils/text';

const REP_PROFILE_KEY = 'rassid_rep_profile';

export interface RepProfile {
  name: string;
  initials: string;
  phone: string;
}

export async function saveRepProfile(profile: {
  name: string;
  phone?: string;
  initials?: string;
}): Promise<RepProfile> {
  const saved: RepProfile = {
    name: profile.name.trim(),
    initials: profile.initials?.trim()
      ? profile.initials.trim().toUpperCase().slice(0, 2)
      : computeInitials(profile.name),
    phone: profile.phone?.trim() || '',
  };
  await SecureStore.setItemAsync(REP_PROFILE_KEY, JSON.stringify(saved));
  return saved;
}

export async function getRepProfile(): Promise<RepProfile | null> {
  const raw = await SecureStore.getItemAsync(REP_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RepProfile;
  } catch {
    return null;
  }
}

export async function hasRepProfile(): Promise<boolean> {
  const profile = await getRepProfile();
  return profile !== null && profile.name.length > 0;
}

export async function clearRepProfile(): Promise<void> {
  await SecureStore.deleteItemAsync(REP_PROFILE_KEY);
}
