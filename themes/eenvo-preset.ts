import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

/**
 * Tema da marca "eenvo"
 * Identidade: Roxo (violet/indigo) + cinza escuro — operando em modo LIGHT (white mode).
 *
 * `primary` usa a paleta violet do PrimeVue.
 * `surface` usa uma escala de cinza (zinc/slate) para fundos, bordas e textos.
 *
 * O modo escuro é intencionalmente desativado: `darkModeSelector` aponta para
 * uma classe (`.app-dark`) que nunca é aplicada no app, mantendo sempre o tema claro.
 */
const EenvoPreset = definePreset(Aura, {
  semantic: {
    // Cor primária da marca eenvo — roxo profundo #440087 (ramp customizado).
    primary: {
      50: '#f6eefe',
      100: '#ead6fc',
      200: '#d4adf7',
      300: '#bb82f0',
      400: '#9d52e3',
      500: '#7c2bd0',
      600: '#5e15ad',
      700: '#440087',
      800: '#370070',
      900: '#2c0059',
      950: '#1c0039'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#440087',
          contrastColor: '#ffffff',
          hoverColor: '#5e15ad',
          activeColor: '#370070'
        },
        highlight: {
          background: '#f6eefe',
          focusBackground: '#ead6fc',
          color: '#440087',
          focusColor: '#370070'
        },
        // Superfícies em escala de cinza (slate) para o white mode
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}'
        }
      }
    }
  }
})

export default {
  preset: EenvoPreset,
  options: {
    // Nunca aplicamos a classe `.app-dark` -> app permanece sempre em modo claro.
    darkModeSelector: '.app-dark',
    cssLayer: {
      name: 'primevue',
      order: 'theme, base, primevue'
    }
  }
}
