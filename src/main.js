import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'f1Theme',
        themes: {
            f1Theme: {
                dark: false,
                colors: {
                    primary: '#E10600', // F1 red
                    secondary: '#15151E', // F1 dark blue/black
                    surface: '#ffffff',
                    background: '#f5f5f5',
                }
            }
        }
    }
})

createApp(App).use(vuetify).mount('#app')
