import { createApp } from 'vue';
import ElementPlus, { ElMessageBox } from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';

import App from './App.vue';
import router from './router';
import { createAppStore, storeKey } from './store';
import { createAppSocket } from './lib/AppSocket';
import { newCommander } from './lib/Commander';

const socket = createAppSocket('wss://ucs-api.pril.cc');
const commander = newCommander(socket);
const store = createAppStore(commander);

// clear login info
socket.onconnect(() => store.commit('userInfo', { id: '', level: 0 }));

// loading state
socket.onloading(v => store.commit('loading', v));

const app = createApp(App);
app.use(ElementPlus);
app.use(router);
app.use(store, storeKey);

app.config.errorHandler = e => {
  console.error(e);

  // eslint-disable-next-line
  const ee: any = e;

  let message = '';
  if (typeof e === 'string') message = e.split('\n')[0];
  else message = ee?.message ? ee?.message : ee;
  if (!alert)
    return;

  ElMessageBox({ message, title: 'error', type: 'error', dangerouslyUseHTMLString: true });
}

app.mount('#app');
