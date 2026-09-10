(() => {
  const boot = () => {
    const results = document.getElementById('results')
    if (!results || results.dataset.redesigned === '1') return
    results.dataset.redesigned = '1'

    const cards = [...results.children].filter((node) => node.classList?.contains('card'))
    const summary = document.getElementById('personalDataSummary')
    const name = summary?.querySelector('#pds-name')?.textContent?.trim() || summary?.querySelector('h1,h2,h3,strong')?.textContent?.trim() || summary?.innerText?.split('\n')[0]?.trim() || ''
    const date = summary?.querySelector('#pds-details')?.textContent?.trim() || summary?.innerText?.split('\n')[1]?.trim() || ''

    const hero = document.createElement('section')
    hero.className = 'report-hero'
    hero.innerHTML = `<p class="report-kicker">КРИСТАЛЛ СУДЬБЫ</p><h1>Персональный разбор</h1><p class="report-name"></p><p class="report-meta"></p><a class="report-pdf-link" href="#" data-pdf-action>Скачать PDF</a>`
    hero.querySelector('.report-name').textContent = name
    hero.querySelector('.report-meta').textContent = date
    results.prepend(hero)
    const syncIdentity = () => {
      const liveSummary = document.getElementById('personalDataSummary')
      const liveName = liveSummary?.querySelector('#pds-name')?.textContent?.trim()
      const liveDate = liveSummary?.querySelector('#pds-details')?.textContent?.trim()
      if (liveName) hero.querySelector('.report-name').textContent = liveName
      if (liveDate) hero.querySelector('.report-meta').textContent = liveDate
    }
    setTimeout(syncIdentity, 250)

    const nav = document.createElement('nav')
    nav.className = 'report-chapter-nav'
    nav.setAttribute('aria-label', 'Навигация по разбору')
    const chapters = [
      ['Главное', 'chapter-main'], ['Личность', 'chapter-personality'], ['Отношения', 'chapter-relationships'],
      ['Деньги и карьера', 'chapter-career'], ['Периоды', 'chapter-periods'], ['Карма', 'chapter-karma'],
      ['Карты и матрицы', 'chapter-maps'], ['Дополнительно', 'chapter-extra'],
    ]
    chapters.forEach(([label, id]) => {
      const link = document.createElement('a')
      link.href = `#${id}`
      link.textContent = label
      nav.append(link)
    })
    hero.after(nav)

    const rules = [
      ['chapter-main', /^(Что означает твоя дата|Что означает твоё имя|Ключевые числа|Персональные данные)/i],
      ['chapter-personality', /(характер|личност|желани|стихия|ловушка судьбы|возраст души|здоровь)/i],
      ['chapter-relationships', /(отношени|личн(ая|ой) жизни|партн|любов)/i],
      ['chapter-career', /(призвание|карьер|профес|реализац|финанс|деньг|работ)/i],
      ['chapter-periods', /(период|цикл|возраст|график судьбы|метацикл|год жизни)/i],
      ['chapter-karma', /(карми|родов|прошл(ая|ой) жизни|планетарн|социальн)/i],
      ['chapter-maps', /(матриц|карта|мандал|ло-шу|график|вектор)/i],
      ['chapter-extra', /(цвет|талисман|дополн|символ|рекомендац)/i],
    ]
    const assigned = new Set()
    rules.forEach(([id, pattern]) => {
      const anchor = document.createElement('div')
      anchor.id = id
      anchor.className = 'report-chapter-anchor'
      results.append(anchor)
      cards.forEach((card) => {
        if (assigned.has(card)) return
        const title = card.querySelector('.section-title,h2,h3')?.textContent || card.innerText.slice(0, 220)
        if (pattern.test(title)) {
          card.dataset.chapter = id
          assigned.add(card)
        }
      })
    })
    cards.forEach((card) => {
      if (!assigned.has(card)) card.dataset.chapter = 'chapter-extra'
      const title = card.querySelector('.section-title,h2,h3')
      if (title) title.classList.add('report-card-title')
    })

    const insight = document.createElement('section')
    insight.className = 'report-insights report-major-section'
    insight.id = 'report-insights'
    insight.innerHTML = '<div class="report-section-eyebrow">Главное о Вас</div><h2>Самые важные выводы из Вашего персонального разбора</h2><p>Ваш разбор собран из индивидуальных кодов даты рождения, имени и жизненных циклов.</p>'
    const insightGrid = document.createElement('div')
    insightGrid.className = 'report-insight-grid'
    const candidates = cards.filter((card) => /(ключевые числа|призвание|отношени|карьер|период)/i.test(card.innerText)).slice(0, 5)
    candidates.forEach((card) => {
      const item = document.createElement('article')
      item.className = 'report-insight-card'
      item.innerHTML = '<span>ВАЖНЫЙ ВЫВОД</span><strong></strong><p></p>'
      item.querySelector('strong').textContent = card.querySelector('.section-title,h2,h3')?.textContent?.trim() || 'Ваш личный код'
      item.querySelector('p').textContent = card.innerText.replace(/\s+/g, ' ').trim().slice(0, 210) + '…'
      insightGrid.append(item)
    })
    if (insightGrid.children.length) { insight.append(insightGrid); hero.after(insight) }

    const pdf = hero.querySelector('[data-pdf-action]')
    pdf.addEventListener('click', (event) => {
      event.preventDefault()
      window.print()
    })

    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      const link = nav.querySelector(`a[href="#${entry.target.id}"]`)
      if (entry.isIntersecting) { nav.querySelectorAll('a').forEach((a) => a.classList.remove('is-active')); link?.classList.add('is-active') }
    }), { rootMargin: '-25% 0px -65% 0px' })
    nav.querySelectorAll('a').forEach((link) => observer.observe(document.querySelector(link.getAttribute('href'))))
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true })
  else boot()
})()
