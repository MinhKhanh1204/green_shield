const HOME_SECTION_IDS = ['home', 'about', 'mission', 'products', 'advantages', 'community', 'contact']

function getScrollContainer() {
  return typeof document === 'undefined' ? null : document.querySelector('.app-scroll')
}

function getTarget(id) {
  if (typeof document === 'undefined' || !id) return null

  // querySelectorAll lets us recover gracefully if an old section is mounted twice;
  // the last match is the section users see at the end of the home page.
  const matches = Array.from(document.querySelectorAll('[id]')).filter((element) => element.id === id)
  return matches.at(-1) || null
}

function getSectionTop(target, container) {
  const containerRect = container.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  return Math.max(0, container.scrollTop + targetRect.top - containerRect.top)
}

export function scrollToHomeSection(id, { behavior = 'smooth', updateHash = true } = {}) {
  const target = getTarget(id)
  if (!target) return false

  const container = getScrollContainer()
  if (container) {
    const isContact = id === 'contact'
    const top = isContact
      ? Math.max(0, container.scrollHeight - container.clientHeight)
      : getSectionTop(target, container)
    container.scrollTo({ top, behavior })
  } else {
    target.scrollIntoView({ behavior, block: 'start', inline: 'nearest' })
  }

  if (updateHash && typeof window !== 'undefined' && window.history?.replaceState) {
    window.history.replaceState(null, '', `#${id}`)
  }

  return true
}

export function hasHomeSection(id) {
  return Boolean(getTarget(id))
}

export { HOME_SECTION_IDS }
