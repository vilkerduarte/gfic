import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Lara from '@primevue/themes/lara'
import { definePreset } from '@primeuix/themes';

// Componentes PrimeVue
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel';
import Slider from 'primevue/slider'
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Toolbar from 'primevue/toolbar';
import Tooltip from 'primevue/tooltip'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import Dialog from 'primevue/dialog'
import InputMask from 'primevue/inputmask'
import InputNumber from 'primevue/inputnumber'
import QrcodeVue from 'qrcode.vue'
// import Dropdown from 'primevue/dropdown'

// CSS
// import 'primevue/resources/primevue.min.css'
import './style.css';
import 'primeicons/primeicons.css'

const IS_VITE_DEV = import.meta.env.DEV || false;

if (IS_VITE_DEV) {
  // Define o indicativo no window
  window.API_SERVER_HOST = 'http://localhost:3000';
} else {
  window.API_SERVER_HOST = 'https://api.gfic.pro';
}
console.log(Lara);

const myschema = {
  ...Lara.semantic.colorScheme.dark,
  primary: {
    "color": "{primary.500}",
    "contrastColor": "{surface.900}",
    "hoverColor": "{primary.400}",
    "activeColor": "{primary.100}"
  },
  surface: {
    "0": "#ffffff",
    "50": "{slate.50}",
    "100": "{slate.100}",
    "200": "{slate.200}",
    "300": "{slate.300}",
    "400": "{slate.400}",
    "500": "{slate.500}",
    "600": "{slate.600}",
    "700": "{slate.700}",
    "800": "{slate.800}",
    "900": "{slate.900}",
    "950": "{slate.950}"
  }
}
const compomnentScheme = {
      colorScheme:{
        light:{
          root:{
            background:'{content.background}',
          }
        },
        dark:{
          root:{
            background:'{content.background}',
          }
        }
      }
    }
const MyPreset = definePreset(Lara, {
  semantic: {
    primary: {
      0: '#ffffff',
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    },
    colorScheme: {
      light: myschema,
      dark: myschema
    }
  },
  components:{
    toolbar:compomnentScheme,
    button:{
      colorScheme:{
        light:Lara.components.button.colorScheme.dark
      }
    },
    inputgroup:{
      colorScheme:{
        light:{addon:compomnentScheme.colorScheme.dark.root},
        dark:{addon:compomnentScheme.colorScheme.dark.root}
      }
    }
  }
});

console.log(Lara.components.button)
const app = createApp(App)
app.use(router)


app.component('InputText', InputText)
// app.component('Dropdown', Dropdown)
app.component('Button', Button)
app.component('FloatLabel', FloatLabel)
app.component('Tabs', Tabs)
app.component('TabList', TabList)
app.component('Tab', Tab)
app.component('TabPanels', TabPanels)
app.component('TabPanel', TabPanel)
app.component('Toolbar', Toolbar)
app.component('Toast', Toast)
app.component('IconField', IconField)
app.component('InputIcon', InputIcon)
app.component('InputGroup', InputGroup)
app.component('InputGroupAddon', InputGroupAddon)
app.component('Dialog', Dialog)
app.component('InputMask', InputMask)
app.component('InputNumber', InputNumber)
app.component('Slider', Slider)
app.component('QrcodeVue', QrcodeVue)


app.directive('tooltip', Tooltip)

app.use(PrimeVue, {
  theme: {
    preset: MyPreset
  }
})
app.use(ToastService);
app.mount('#app')
