import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import { beforeAll, describe, expect, it } from 'vitest'

let doc: Document

beforeAll(() => {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8')
  doc = new JSDOM(html).window.document
})

describe('page structure', () => {
  it('points every in-page link at a section that exists', () => {
    const anchors = [...doc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
    const broken = anchors
      .map((a) => a.getAttribute('href')!)
      .filter((href) => href.length > 1 && !doc.querySelector(href))

    expect(broken).toEqual([])
  })

  it('gives every image alt text and explicit dimensions', () => {
    const images = [...doc.querySelectorAll('img')]
    expect(images.length).toBeGreaterThan(0)

    for (const img of images) {
      expect(img.getAttribute('alt')).toBeTruthy()
      expect(img.getAttribute('width')).toBeTruthy()
      expect(img.getAttribute('height')).toBeTruthy()
    }
  })

  it('opens external links safely', () => {
    const external = [...doc.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')]
    expect(external.length).toBeGreaterThan(0)

    for (const link of external) {
      expect(link.getAttribute('rel')).toContain('noopener')
    }
  })

  it('references assets with relative paths so one build serves any mount point', () => {
    const refs = [...doc.querySelectorAll('link[href], img[src], a[href$=".pdf"]')]
      .map((el) => el.getAttribute('href') ?? el.getAttribute('src') ?? '')
      .filter((value) => !value.startsWith('#') && !value.startsWith('http'))

    for (const ref of refs) {
      expect(ref.startsWith('/')).toBe(false)
    }
  })

  it('has the metadata search engines and link previews need', () => {
    expect(doc.querySelector('title')?.textContent).toBeTruthy()
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')).toBeTruthy()
    expect(doc.querySelector('meta[property="og:title"]')).not.toBeNull()
    expect(doc.documentElement.getAttribute('lang')).toBe('en')
  })

  it('exposes a skip link as the first focusable element', () => {
    const first = doc.querySelector('body a, body button')
    expect(first?.getAttribute('href')).toBe('#main')
  })

  it('carries no leftover design-mockup markers', () => {
    expect(doc.body.textContent).not.toMatch(/FLOW [AC]/)
  })

  it('shows the current roles from the résumé', () => {
    const text = doc.body.textContent ?? ''
    for (const employer of ['Apple', 'MyPOP.ai', 'TruckX', 'Dangote']) {
      expect(text).toContain(employer)
    }
  })

  it('renders every company logo in the marquee', () => {
    const logos = [...doc.querySelectorAll('img[src*="logos/"]')].map((el) =>
      el.getAttribute('src'),
    )
    for (const mark of ['apple', 'mypop', 'truckx', 'dangote', 'usf']) {
      expect(logos.some((src) => src?.includes(mark))).toBe(true)
    }
  })
})
