import Vue from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';

import "primevue/resources/themes/saga-blue/theme.css"; //theme
import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import 'primeflex/primeflex.css';

import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import Chart from 'primevue/chart';

Vue.use(PrimeVue)

Vue.component("Splitter", Splitter);
Vue.component("SplitterPanel", SplitterPanel);
Vue.component("Toolbar", Toolbar);
Vue.component("Button", Button);
Vue.component("Chart", Chart)


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
