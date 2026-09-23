/** Post dates are "MM/DD/YY" strings; see src/data/projects.js. */
function parseDate(d) {
  const [m, day, y] = d.split('/')
  return new Date(`20${y}`, parseInt(m) - 1, parseInt(day))
}

export function newestFirst(posts) {
  return [...posts].sort((a, b) => parseDate(b.date) - parseDate(a.date))
}
