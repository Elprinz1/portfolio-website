import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initMarquee, initMobileMenu, initYear } from '../src/shared'

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

describe('mobile menu', () => {
  it('opens, then closes when a link is chosen', () => {
    document.body.innerHTML = `
      <button data-menu-toggle aria-expanded="false"></button>
      <div data-menu class="hidden"><a href="#work">Work</a></div>
    `
    initMobileMenu()

    const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')!
    const menu = document.querySelector<HTMLElement>('[data-menu]')!

    toggle.click()
    expect(menu.classList.contains('hidden')).toBe(false)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')

    menu.querySelector('a')!.click()
    expect(menu.classList.contains('hidden')).toBe(true)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })
})

describe('footer', () => {
  it('stamps the current year', () => {
    document.body.innerHTML = '<span data-year>1999</span>'
    initYear()

    expect(document.querySelector('[data-year]')?.textContent).toBe(
      String(new Date().getFullYear()),
    )
  })
})

describe('company marquee', () => {
  /* The CSS shifts the track by -50%, so the DOM must hold an even number of
     copies for the loop to reset invisibly. */
  it('repeats the logo set an even number of times', () => {
    document.body.innerHTML = '<div data-marquee><span class="logo">A</span></div>'
    const track = document.querySelector<HTMLElement>('[data-marquee]')!
    // jsdom reports zero layout width, so stub the measurement the fill loop reads.
    Object.defineProperty(track, 'scrollWidth', { configurable: true, value: 200 })

    initMarquee()

    const count = track.querySelectorAll('.logo').length
    expect(count).toBeGreaterThanOrEqual(2)
    expect(count % 2).toBe(0)
  })

  it('leaves the track alone when it cannot be measured', () => {
    document.body.innerHTML = '<div data-marquee><span class="logo">A</span></div>'
    const track = document.querySelector<HTMLElement>('[data-marquee]')!
    Object.defineProperty(track, 'scrollWidth', { configurable: true, value: 0 })

    initMarquee()

    expect(track.querySelectorAll('.logo').length).toBe(1)
  })
})
