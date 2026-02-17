// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createGtm, useGtm } from '../src/index'

// Mock Core
vi.mock('@ahdcreative/gtm-core', async () => {
  return {
    loadGTM: vi.fn(),
    loadNoScript: vi.fn(),
    pushToDataLayer: vi.fn(),
  }
})

import { loadGTM, pushToDataLayer } from '@ahdcreative/gtm-core'

describe('Vue GTM Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  })

  it('should install plugin and load GTM', () => {
    const app = createApp({})
    const gtm = createGtm({ id: 'GTM-TEST' })
    app.use(gtm)

    expect(app.config.globalProperties.$gtm).toBeDefined()
    expect(loadGTM).toHaveBeenCalledWith(expect.objectContaining({ id: 'GTM-TEST' }))
  })

  it('should push events via composable', () => {
    const app = createApp({
      setup() {
        const gtm = useGtm()
        gtm.push({ event: 'test_event' })
        return {}
      },
    })
    const gtm = createGtm({ id: 'GTM-TEST' })
    app.use(gtm)
    app.mount(document.createElement('div'))

    expect(pushToDataLayer).toHaveBeenCalledWith({ event: 'test_event' })
  })

  it('should track page views', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: 'Home' } },
        { path: '/about', component: { template: 'About' } },
      ],
    })

    const app = createApp({})
    const gtm = createGtm({
      id: 'GTM-TEST',
      vueRouter: router,
    })

    app.use(router)
    app.use(gtm)

    await router.push('/')
    await router.isReady()

    // Simulate navigation
    await router.push('/about')

    // Wait for next tick/timeout in plugin
    await new Promise((r) => setTimeout(r, 10))

    expect(pushToDataLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'page_view',
        page_path: '/about',
      }),
    )
  })
})
