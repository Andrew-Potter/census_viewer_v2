import Vue from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';

import "primevue/resources/themes/saga-blue/theme.css"; //theme
import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import 'primeflex/primeflex.css';

import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import ToggleButton from 'primevue/togglebutton'
import Dropdown from 'primevue/dropdown';

import Sidebar from 'primevue/sidebar';
import Panel from "primevue/panel"
import Card from "primevue/card"
import Dialog from 'primevue/dialog';

Vue.use(PrimeVue)

Vue.component("Toolbar", Toolbar);
Vue.component("Button", Button);
Vue.component("Chart", Chart)
Vue.component("ToggleButton", ToggleButton)
Vue.component("Dropdown", Dropdown)
Vue.component("Sidebar", Sidebar)
Vue.component("Panel", Panel)
Vue.component("Card", Card)
Vue.component("Dialog", Dialog)


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
