/* Behaviour shared by both design flows. Each flow imports this plus its own CSS. */

export function initReveals(): void {
  const targets = document.querySelectorAll<HTMLElement>('.reveal')

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'))
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  )

  targets.forEach((el) => observer.observe(el))
}

export function initNavChrome(): void {
  const nav = document.querySelector<HTMLElement>('[data-nav]')
  if (!nav) return
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

export function initScrollSpy(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-navlink]')]
  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((el): el is HTMLElement => el !== null)
  if (!sections.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        links.forEach((link) =>
          link.setAttribute('aria-current', String(link.hash === `#${entry.target.id}`)),
        )
      })
    },
    { rootMargin: '-45% 0px -50% 0px' },
  )
  sections.forEach((section) => observer.observe(section))
}

export function initMobileMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')
  const menu = document.querySelector<HTMLElement>('[data-menu]')
  if (!toggle || !menu) return

  const setOpen = (open: boolean) => {
    menu.classList.toggle('hidden', !open)
    toggle.setAttribute('aria-expanded', String(open))
  }
  toggle.addEventListener('click', () => setOpen(menu.classList.contains('hidden')))
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) setOpen(false)
  })
}

/* The CSS animation translates the track by -50%, i.e. exactly one copy of the
   original items, so the loop is seamless — but only if a single copy is at
   least as wide as the viewport. With four logos on a wide screen it isn't, and
   a gap scrolls past. Repeat the set until one copy fills the screen, then
   duplicate that whole run for the -50% reset to land invisibly. */
export function initMarquee(): void {
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((track) => {
    const original = track.innerHTML

    const fill = () => {
      track.innerHTML = original
      const unitWidth = track.scrollWidth
      if (unitWidth === 0) return

      const copies = Math.max(2, Math.ceil(window.innerWidth / unitWidth) + 1)
      track.innerHTML = original.repeat(copies * 2)
    }

    fill()
    window.addEventListener('resize', fill, { passive: true })
  })
}

export function initYear(): void {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear())
  })
}

export function initAll(): void {
  initReveals()
  initNavChrome()
  initScrollSpy()
  initMobileMenu()
  initMarquee()
  initYear()
}
