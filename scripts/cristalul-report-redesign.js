(() => {
  const boot = () => {
    const results = document.getElementById('results')
    if (!results || results.dataset.redesigned === '3') return
    results.dataset.redesigned = '3'
    // Raportul permanent trebuie să fie vizibil imediat; modul auto=1 ascunde rezultatele până la calcul.
    results.style.display = 'block'

    const cards = [...results.children].filter((node) => node.classList?.contains('card'))
    const summary = document.getElementById('personalDataSummary')
    const name = summary?.querySelector('#pds-name')?.textContent?.trim() || ''
    const date = summary?.querySelector('#pds-details')?.textContent?.trim() || ''

    const hero = document.createElement('section')
    hero.className = 'report-hero'
    hero.innerHTML = '<div class="report-hero-mark" aria-hidden="true"><span></span></div><p class="report-kicker">КРИСТАЛЛ СУДЬБЫ</p><h1>Персональный разбор</h1><p class="report-name"></p><p class="report-meta"></p>'
    hero.querySelector('.report-name').textContent = name
    hero.querySelector('.report-meta').textContent = date
    results.prepend(hero)

    const nav = document.createElement('nav')
    nav.className = 'report-chapter-nav'
    nav.setAttribute('aria-label', 'Навигация по разбору')
    const chapterLinks = [
      ['Обзор', 'report-start'], ['Характер', 'report-personality'], ['Отношения', 'report-relationships'],
      ['Реализация', 'report-realization'], ['Периоды', 'report-periods'], ['Полный разбор', 'report-full'],
    ]
    chapterLinks.forEach(([label, id]) => {
      const link = document.createElement('a')
      link.href = `#${id}`
      link.textContent = label
      nav.append(link)
    })
    hero.after(nav)

    const start = document.createElement('div')
    start.id = 'report-start'
    start.className = 'report-start-anchor'
    nav.after(start)

    cards.forEach((card, index) => {
      card.dataset.reportIndex = String(index)
      card.id = index === 0 ? 'report-personality' : index === 1 ? 'report-relationships' : index === 2 ? 'report-realization' : index === 3 ? 'report-periods' : ''
      card.querySelector('.section-title,h2,h3')?.classList.add('report-card-title')
    })

    const full = document.createElement('div')
    full.id = 'report-full'
    full.className = 'report-full-anchor'
    results.append(full)

    const syncIdentity = () => {
      const liveSummary = document.getElementById('personalDataSummary')
      const liveName = liveSummary?.querySelector('#pds-name')?.textContent?.trim()
      const liveDate = liveSummary?.querySelector('#pds-details')?.textContent?.trim()
      if (liveName) hero.querySelector('.report-name').textContent = liveName
      if (liveDate) hero.querySelector('.report-meta').textContent = liveDate
    }
    setTimeout(syncIdentity, 250)

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault()
      document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }))
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true })
  else boot()
})()
