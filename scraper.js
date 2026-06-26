// Runs INSIDE the claude.ai page (serialized via .toString()), so it must be a
// standalone function with no outside references. Returns plain JSON.
//
// Strategy: don't rely on volatile Tailwind class names. For each progress bar,
// climb to the row (the nearest ancestor whose text is MORE than just the value),
// then read the sibling column that holds the label + reset text.
module.exports = function scrapeInPage () {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim()
  const txt = el => (el ? clean(el.textContent) : null)
  const plan = txt(document.querySelector('h3 .text-text-300')) ||
    txt(document.querySelector('h3 span.font-medium'))

  const sections = []
  document.querySelectorAll('section').forEach(sec => {
    let title = txt(sec.querySelector('h3'))
    if (title && plan && title.endsWith(plan)) title = title.slice(0, -plan.length).trim()

    const rows = []
    sec.querySelectorAll('[role="progressbar"]').forEach(pb => {
      // value = text of the column holding the bar (the bar element itself has no text)
      const barCol = pb.closest('.flex-1')
      const valCol = barCol ? barCol.parentElement : pb.parentElement
      const value = clean(valCol && valCol.textContent)

      // row = nearest ancestor whose text is more than just the value
      // (i.e. the one that also contains the label/reset column)
      let row = pb
      while (row && clean(row.textContent).length <= value.length + 1) row = row.parentElement
      if (!row) return

      // the sibling column that does NOT contain the bar holds label (top) + reset/note (rest)
      const infoCol = Array.from(row.children).find(c => !c.contains(pb))
      const kids = infoCol ? Array.from(infoCol.children) : []
      const label = kids.length ? clean(kids[0].textContent) : (infoCol ? clean(infoCol.textContent) : '')
      const note = kids.slice(1).map(k => clean(k.textContent)).filter(Boolean).join(' · ') || null

      rows.push({
        label: label || null,
        percent: Number(pb.getAttribute('aria-valuenow')),
        value: value || null,
        note
      })
    })
    if (rows.length) sections.push({ title, rows })
  })

  const lastUpdated = (Array.from(document.querySelectorAll('.text-footnote'))
    .map(e => e.textContent.trim()).find(t => /Last updated/i.test(t)) || '')
    .replace(/^Last updated:\s*/i, '') || null

  return { plan, sections, lastUpdated, loggedIn: sections.length > 0, href: location.href }
}
