import { create } from 'zustand';
import { SupportedLanguage, TRANSLATIONS } from '@/i18n/translations';
import { UserProfile } from '@/types/models';
import { repository } from '@/data/repository';

interface AppStore {
  // Localization
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;

  // Role & Auth
  currentUser: UserProfile;
  setRole: (role: 'citizen' | 'officer' | 'planner') => void;

  // Viewport Frame Mode for Citizen View (Desktop browser demonstration)
  isMobileDeviceFrame: boolean;
  toggleMobileDeviceFrame: () => void;

  // Demo Control Panel
  isDemoDrawerOpen: boolean;
  toggleDemoDrawer: () => void;

  // Toast / Status banner
  toastMessage: { title: string; desc: string; type: 'success' | 'warning' | 'info' } | null;
  showToast: (title: string, desc: string, type?: 'success' | 'warning' | 'info') => void;
  clearToast: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  language: (localStorage.getItem('urbanease_lang_v1') as SupportedLanguage) || 'en',
  setLanguage: (lang) => {
    localStorage.setItem('urbanease_lang_v1', lang);
    set({ language: lang });
  },
  t: (key) => {
    const lang = get().language;
    return TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key] || String(key);
  },

  currentUser: repository.getCurrentUser(),
  setRole: (role) => {
    const allUsers = repository.getUsers();
    const target = allUsers.find((u) => u.role === role) || allUsers[0];
    repository.setCurrentUserId(target.id);
    set({ currentUser: target });
  },

  isMobileDeviceFrame: false,
  toggleMobileDeviceFrame: () => set((state) => ({ isMobileDeviceFrame: !state.isMobileDeviceFrame })),

  isDemoDrawerOpen: false,
  toggleDemoDrawer: () => set((state) => ({ isDemoDrawerOpen: !state.isDemoDrawerOpen })),

  toastMessage: null,
  showToast: (title, desc, type = 'info') => {
    set({ toastMessage: { title, desc, type } });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 4500);
  },
  clearToast: () => set({ toastMessage: null }),
}));
