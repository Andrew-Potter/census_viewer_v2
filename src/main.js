import Vue from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';

import "flex-splitter-directive"
import "flex-splitter-directive/styles.min.css"

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
import InputText from 'primevue/inputtext';

import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton';

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
Vue.component("Checkbox", Checkbox)
Vue.component("Splitter", Splitter)
Vue.component("SplitterPanel", SplitterPanel) 
Vue.component("InputText", InputText)   
Vue.component("RadioButton", RadioButton)   


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
