(() => {
  const boot = () => {
    const results = document.getElementById('results')
    if (!results || results.dataset.redesigned === '2') return
    results.dataset.redesigned = '2'

    const cards = [...results.children].filter((node) => node.classList?.contains('card'))
    const summary = document.getElementById('personalDataSummary')
    const name = summary?.querySelector('#pds-name')?.textContent?.trim() || ''
    const date = summary?.querySelector('#pds-details')?.textContent?.trim() || ''

    const hero = document.createElement('section')
    hero.className = 'report-hero'
    hero.innerHTML = '<p class="report-kicker">КРИСТАЛЛ СУДЬБЫ</p><h1>Персональный разбор</h1><p class="report-name"></p><p class="report-meta"></p><button class="report-pdf-link" type="button">Скачать PDF</button>'
    hero.querySelector('.report-name').textContent = name
    hero.querySelector('.report-meta').textContent = date
    results.prepend(hero)

    const nav = document.createElement('nav')
    nav.className = 'report-chapter-nav'
    nav.setAttribute('aria-label', 'Навигация по разбору')
    const chapterLinks = [
      ['Главное', 'chapter-main'], ['Сейчас', 'chapter-now'], ['Личность', 'chapter-personality'],
      ['Отношения', 'chapter-relationships'], ['Реализация', 'chapter-realization'], ['Глубже', 'chapter-deep'],
    ]
    chapterLinks.forEach(([label, id]) => {
      const link = document.createElement('a')
      link.href = `#${id}`
      link.textContent = label
      nav.append(link)
    })
    hero.after(nav)

    const text = (card) => `${card.querySelector('.section-title,h2,h3')?.textContent || ''} ${card.innerText}`
    const matches = (card, pattern) => pattern.test(text(card))
    const groups = [
      ['chapter-main', /ключев|главн|сильн|конфликт|путь|значит/i],
      ['chapter-now', /сейчас|текущ|период|задач периода|год жизни/i],
      ['chapter-personality', /характер|личност|имя|желани|стихия|ловуш|души|подсозн/i],
      ['chapter-relationships', /отношени|любов|партн|личн(ая|ой) жизни/i],
      ['chapter-realization', /призвани|карьер|профес|реализац|финанс|деньг|работ/i],
      ['chapter-deep', /карм|родов|прошл|планет|матриц|мандал|ло-шу|вектор|метацикл|талисман|дополн|цик[лп]/i],
    ]

    const assigned = new Set()
    const sections = new Map()
    groups.forEach(([id, pattern]) => {
      const section = document.createElement('section')
      section.className = 'report-chapter'
      section.id = id
      section.innerHTML = `<div class="report-section-eyebrow">${chapterLinks.find(([, key]) => key === id)?.[0] || ''}</div>`
      const content = document.createElement('div')
      content.className = 'report-chapter-content'
      section.append(content)
      sections.set(id, { section, content, pattern })
      results.append(section)
    })

    cards.forEach((card) => {
      const destination = groups.find(([, pattern]) => matches(card, pattern))?.[0] || 'chapter-deep'
      sections.get(destination).content.append(card)
      assigned.add(card)
      card.dataset.chapter = destination
      card.querySelector('.section-title,h2,h3')?.classList.add('report-card-title')
    })

    const moveOverflowToDeep = (id, limit) => {
      const group = sections.get(id)
      const deep = sections.get('chapter-deep')
      if (!group || !deep) return
      ;[...group.content.children].slice(limit).forEach((card) => deep.content.append(card))
    }
    moveOverflowToDeep('chapter-main', 4)
    moveOverflowToDeep('chapter-now', 3)

    const main = sections.get('chapter-main')
    if (main) {
      const insightCards = [...main.content.children].slice(0, 4)
      const summaryBox = document.createElement('div')
      summaryBox.className = 'report-main-summary'
      summaryBox.innerHTML = '<p class="report-summary-label">Главное о Вас</p><h2>Самое важное из Вашего разбора</h2><div class="report-summary-grid"></div>'
      const grid = summaryBox.querySelector('.report-summary-grid')
      insightCards.forEach((card) => {
        const item = document.createElement('article')
        item.className = 'report-summary-item'
        item.innerHTML = '<strong></strong><p></p>'
        item.querySelector('strong').textContent = card.querySelector('.section-title,h2,h3')?.textContent?.trim() || 'Ваш главный код'
        item.querySelector('p').textContent = card.innerText.replace(/\s+/g, ' ').trim().slice(0, 260)
        grid.append(item)
      })
      main.section.prepend(summaryBox)
    }

    ;['chapter-personality', 'chapter-relationships', 'chapter-realization', 'chapter-deep'].forEach((id) => {
      const group = sections.get(id)
      if (!group || !group.content.children.length) return
      const details = document.createElement('details')
      details.className = 'report-details'
      details.open = false
      details.innerHTML = `<summary>${id === 'chapter-deep' ? 'Открыть глубокий разбор' : 'Подробнее'}</summary>`
      const visibleLimit = id === 'chapter-personality' || id === 'chapter-relationships' || id === 'chapter-realization' ? 2 : 0
      while (group.content.children.length > visibleLimit) details.append(group.content.lastElementChild)
      if (details.children.length > 1) group.content.append(details)
    })

    hero.querySelector('.report-pdf-link').addEventListener('click', () => window.print())
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault()
      document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }))
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true })
  else boot()
})()
