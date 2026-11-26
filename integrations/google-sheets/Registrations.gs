// Receives event registrations from the website (/events/<slug>) and adds each
// one as a row in this spreadsheet, in a tab named after the event's slug.
// Only events that take registrations on the site ever send anything here.
// Setup steps are in README.md beside this file.
//
// The questions come from the website (src/features/events/data/forms.js), so
// this script doesn't need editing when a form changes: a new question simply
// becomes a new column at the end of that event's tab.

const MAX_ROWS = 120 // answers per registration (a 3-person team is ~25)
const MAX_LABEL = 200
const MAX_VALUE = 2000

// Apps Script can't see who is sending, so registrations are limited per email
// address and in total. Each is { limit, seconds }; CacheService keeps entries
// for 6 hours at most, so no window can be longer than that.
const RATE = {
  email: { limit: 5, seconds: 6 * 60 * 60 },
  all: { limit: 60, seconds: 10 * 60 },
}

// Optional: slugs that should no longer accept registrations, even from an
// old copy of the website, e.g. ['genesis-hack-2027'].
const CLOSED = []

function doPost(event) {
  let data
  try {
    data = JSON.parse(event.postData.contents)
  } catch (error) {
    return reply({ ok: false, error: 'Invalid request' })
  }

  // Spam bots fill in this hidden field; pretend it worked and save nothing.
  if (data && data.website) return reply({ ok: true })
  if (!isValid(data)) return reply({ ok: false, error: 'Invalid registration' })
  if (CLOSED.indexOf(data.event) !== -1) return reply({ ok: false, error: 'closed' })

  const lock = LockService.getScriptLock()
  try {
    lock.waitLock(20000)
    // The same registration sent again (a retry) is not added twice.
    const cache = CacheService.getScriptCache()
    const key = 'registration-' + String(data.id || '').slice(0, 60)
    if (data.id && cache.get(key)) return reply({ ok: true })

    const emailKey = 'email-' + data.event + '-' + data.email.trim().toLowerCase()
    if (!underLimit(cache, emailKey, RATE.email) || !underLimit(cache, 'all', RATE.all)) {
      return reply({ ok: false, error: 'rate_limited' })
    }

    appendRegistration(data)
    SpreadsheetApp.flush()
    if (data.id) cache.put(key, '1', 21600)
    return reply({ ok: true })
  } catch (error) {
    console.error(error)
    return reply({ ok: false, error: 'Could not save the registration' })
  } finally {
    lock.releaseLock()
  }
}

// Puts each answer under the column with its heading, adding columns for
// headings this tab hasn't seen yet.
function appendRegistration(data) {
  const sheet = getSheet(data.event)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String)
  const added = []
  data.rows.forEach(function (pair) {
    const label = pair[0].trim()
    if (headers.indexOf(label) === -1 && added.indexOf(label) === -1) added.push(label)
  })
  if (added.length) {
    sheet.getRange(1, headers.length + 1, 1, added.length).setValues([added]).setFontWeight('bold')
  }
  const all = headers.concat(added)
  const row = all.map(function () {
    return ''
  })
  row[0] = new Date()
  data.rows.forEach(function (pair) {
    row[all.indexOf(pair[0].trim())] = asText(pair[1])
  })
  sheet.appendRow(row)
}

// Counts one more registration under `name` in the current time window and
// says whether it is still within the limit. Runs inside the script lock, so
// counts can't race. Windows are fixed blocks of `seconds`.
function underLimit(cache, name, rate) {
  const key = 'rate-' + name + '-' + Math.floor(Date.now() / 1000 / rate.seconds)
  const count = Number(cache.get(key) || 0)
  if (count >= rate.limit) return false
  cache.put(key, String(count + 1), rate.seconds)
  return true
}

function isValid(data) {
  if (!data || typeof data.event !== 'string' || !/^[a-z0-9-]{1,60}$/.test(data.event)) return false
  if (typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 200) {
    return false
  }
  if (!Array.isArray(data.rows) || data.rows.length === 0 || data.rows.length > MAX_ROWS) return false
  return data.rows.every(function (pair) {
    return (
      Array.isArray(pair) &&
      typeof pair[0] === 'string' &&
      pair[0].trim() !== '' &&
      pair[0].length <= MAX_LABEL &&
      pair[0] !== 'Submitted' &&
      typeof pair[1] === 'string' &&
      pair[1].length <= MAX_VALUE
    )
  })
}

// The leading apostrophe (hidden in the sheet) keeps answers as plain text, so
// one starting with "=" can't run as a formula.
function asText(value) {
  return "'" + value.trim()
}

function getSheet(slug) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getSheetByName(slug) || spreadsheet.insertSheet(slug)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Submitted'])
    sheet.getRange(1, 1).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

function reply(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON)
}
