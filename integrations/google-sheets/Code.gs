// Receives applications from the website's Join page and adds each one as a
// row in this spreadsheet. Setup steps are in README.md beside this file.

const SHEET_NAME = 'Applications'
const HEADERS = ['Submitted', 'Name', 'College', 'Year', 'Email', 'Facebook', 'Department', 'Reason to join']

// Same choices as src/features/join/fields.js on the website.
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']
const DEPARTMENTS = ['Operations', 'Finance', 'Tech Team', 'Creatives', 'N/A (Member only)']
// Facebook allows more than the form does, since the website tidies the link.
const MAX_LENGTH = { name: 100, college: 120, email: 150, facebook: 2000, reason: 2000 }

function doPost(event) {
  let data
  try {
    data = JSON.parse(event.postData.contents)
  } catch (error) {
    return reply({ ok: false, error: 'Invalid request' })
  }

  // Spam bots fill in this hidden field; pretend it worked and save nothing.
  if (data && data.website) return reply({ ok: true })
  if (!isValid(data)) return reply({ ok: false, error: 'Invalid application' })

  const lock = LockService.getScriptLock()
  try {
    lock.waitLock(20000)
    // The same application sent again (a retry) is not added twice.
    const cache = CacheService.getScriptCache()
    const key = 'application-' + String(data.id || '').slice(0, 60)
    if (data.id && cache.get(key)) return reply({ ok: true })

    getSheet().appendRow([
      new Date(),
      asText(data.name),
      asText(data.college),
      asText(data.year),
      asText(data.email),
      asText(data.facebook),
      asText(data.department),
      asText(data.reason),
    ])
    SpreadsheetApp.flush()
    if (data.id) cache.put(key, '1', 21600)
    return reply({ ok: true })
  } catch (error) {
    console.error(error)
    return reply({ ok: false, error: 'Could not save the application' })
  } finally {
    lock.releaseLock()
  }
}

function isValid(data) {
  if (!data) return false
  const textsOk = Object.keys(MAX_LENGTH).every(function (field) {
    const value = data[field]
    return typeof value === 'string' && value.trim() !== '' && value.length <= MAX_LENGTH[field]
  })
  return (
    textsOk &&
    YEARS.includes(data.year) &&
    DEPARTMENTS.includes(data.department) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) &&
    /^https?:\/\/([\w-]+\.)*(facebook\.com|fb\.com|fb\.me)\/./i.test(data.facebook)
  )
}

// The leading apostrophe (hidden in the sheet) keeps answers as plain text, so
// one starting with "=" can't run as a formula.
function asText(value) {
  return "'" + value.trim()
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

function reply(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON)
}
