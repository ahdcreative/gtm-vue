import {
  type GTMEvent,
  type GTMOptions,
  loadGTM,
  loadNoScript,
  pushToDataLayer,
} from '@ahdcreative/gtm-core'
import type { App, Plugin } from 'vue'
import { inject } from 'vue'
import type { Router } from 'vue-router'

export const GTM_SYMBOL = Symbol('GTM')

export interface VueGtmOptions extends GTMOptions {
  vueRouter?: Router
  trackOnNextTick?: boolean
}

export interface GtmInstance {
  push: (event: GTMEvent | object) => void
  load: () => void
  enable: (enabled?: boolean) => void
  debug: (enabled?: boolean) => void
}

/**
 * Creates the GTM Vue plugin instance.
 */
export function createGtm(options: VueGtmOptions): Plugin {
  return {
    install(app: App) {
      const gtm: GtmInstance = {
        push: (event) => pushToDataLayer(event),
        load: () => {
          loadGTM(options)
          if (options.enabled !== false) {
            loadNoScript(options)
          }
        },
        enable: (val = true) => console.log('[VueGtm] Enable not fully implemented', val),
        debug: (val = true) => console.log('[VueGtm] Debug mode:', val), // Placeholder
      }

      // Initial Load
      gtm.load()

      // Router Integration
      if (options.vueRouter) {
        options.vueRouter.afterEach((to) => {
          // Verify we're not just hash changing or same page
          setTimeout(
            () => {
              gtm.push({
                event: 'page_view',
                page_path: to.path,
                page_title: typeof document !== 'undefined' ? document.title : '',
                page_location: typeof window !== 'undefined' ? window.location.href : '',
              })
            },
            options.trackOnNextTick ? 0 : 0,
          )
        })
      }

      // Provide & Global Property
      app.provide(GTM_SYMBOL, gtm)
      app.config.globalProperties.$gtm = gtm
    },
  }
}

/**
 * Composition API hook to access GTM instance.
 */
export function useGtm(): GtmInstance {
  const gtm = inject<GtmInstance>(GTM_SYMBOL)
  if (!gtm) {
    throw new Error('GTM plugin not installed. Did you run app.use(gtm)?')
  }
  return gtm
}
