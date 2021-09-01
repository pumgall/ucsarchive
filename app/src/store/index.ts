// import { InjectionKey } from 'vue';
import { createStore, /*Store, */ useStore } from 'vuex';

// import { AppSocket } from '../lib/AppSocket';
import { Commander } from '../lib/Commander';

export interface AppState {
  loading: boolean;
  cmd: Commander;
  userId: string;
  userLevel: number;
}

// export const storeKey: InjectionKey<Store<AppState>> = Symbol();
export const storeKey = 'default';

export function createAppStore(cmd: Commander) {
  return createStore<AppState>({
    state: {
      cmd,
      userId: '',
      userLevel: 0,
      loading: false,
    },
    mutations: {
      userInfo(state: AppState, { id, level }: { id: string; level: number }) {
        state.userId = id;
        state.userLevel = level;
      },
      loading(state: AppState, v: boolean) {
        state.loading = v;
      },
    },
    actions: {},
    modules: {},
  });
}

export function getStore() {
  return useStore<AppState>(storeKey);
}