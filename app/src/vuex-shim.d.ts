import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'

import { AppStore } from './store';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<AppStore>
  }
}