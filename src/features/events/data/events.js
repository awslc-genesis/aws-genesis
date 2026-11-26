import { basicForm, hackathonForm } from './forms'

// ─────────────────────────────────────────────────────────────────────────────
// Every Genesis event, in one place. The Events page (/events), each event's
// own page (/events/<slug>) and the home page's Latest Events strip all read
// this list, so adding or editing an event here updates the whole site.
//
// Order doesn't matter: upcoming events are sorted soonest first and past ones
// newest first. Whether an event is upcoming, happening now or past is worked
// out from its dates (Philippine time), so nothing needs moving once it's over.
//
// Fields
//   slug          Address of its page: /events/<slug>. Lowercase, dashes,
//                 unique. Registrations land in a Google Sheets tab of this name.
//   title         Event name.
//   type          'Hackathon' | 'Webinar' | 'Seminar'. Picks the registration
//                 form: Hackathon gets the team form (Setup, Eligibility,
//                 Members, Review); Webinar and Seminar get the one-page form.
//   registration  true if people sign up for it on this site, false if not.
//                 Only events with true show a form and send to Google Sheets.
//   date          First day, 'YYYY-MM-DD'. Leave it out while the date is still
//                 to be announced; the event then shows as upcoming, 'Date TBA'.
//   endDate       Last day, for events longer than a day (optional).
//   time          Shown as written, e.g. '1:00 – 4:00 PM' (optional).
//   place         Venue, or 'Online'.
//   mode          'In person', 'Online' or 'Hybrid' (optional).
//   summary       One or two sentences for cards.
//   about         Paragraphs for the event's page (optional).
//   details       Extra facts shown as a list: [{ label, value }] (optional).
//   photoFile     Image in src/assets/images/events (optional). Without one a
//                 stock photo is used.
//   recap         For past events: a link to photos or a write-up (optional).
//
// Optional registration settings, used only when registration is true:
//   closes        Last day to register, 'YYYY-MM-DD'. Otherwise it closes when
//                 the event starts.
//   closed        true to close registration early, e.g. when slots run out.
//   fee           Hackathons only: fee per member in pesos. Adds a Payment step.
//   paymentInfo   Hackathons only: where to send the fee (GCash number…).
//   registerUrl   Register somewhere else instead (a Google Form, Luma…): the
//                 page shows a button to that link and no form.
//   form          Your own questions instead of the type's form (see forms.js).
// ─────────────────────────────────────────────────────────────────────────────
const LIST = [
  {
    slug: 'cloud-computing-101',
    title: 'Cloud Computing 101',
    type: 'Seminar', // 'Hackathon' | 'Webinar' | 'Seminar'
    registration: true,
    closed: false,
    place: 'TSU - San Isidro Campus',
    summary: 'this is a test',
    date: '2027-01-15',
    time: '1:00 – 4:00 PM',
    photoFile: 'tbaEvent.png',
  },
  {
    slug: 'cloud-computing-102',
    title: 'Cloud Computing 102',
    type: 'Hackathon', // 'Hackathon' | 'Webinar' | 'Seminar'
    registration: true,
    closed: false,
    place: 'TSU - San Isidro Campus',
    summary: 'this is a test',
    date: '2027-02-15',
    time: '1:00 – 4:00 PM',
    photoFile: 'tbaEvent.png',
  },
  {
    slug: 'cloud-computing-103',
    title: 'Cloud Computing 103',
    type: 'Webinar', // 'Hackathon' | 'Webinar' | 'Seminar'
    registration: false,
    closed: false,
    place: 'TSU - San Isidro Campus',
    summary: 'this is a test',
    date: '2027-03-15',
    time: '1:00 – 4:00 PM',
    photoFile: 'tbaEvent.png',
  },
]

export const EVENT_TYPES = ['Hackathon', 'Webinar', 'Seminar']

// The form each type uses when registration is true.
function formFor(event) {
  if (event.form) return event.form
  if (event.type === 'Hackathon') {
    return hackathonForm({ fee: event.fee, payment: { instructions: event.paymentInfo } })
  }
  return basicForm()
}

// Turns the simple fields above into what the pages read.
export const EVENTS = LIST.map(event => ({
  ...event,
  registration: event.registration
    ? {
        form: formFor(event),
        closes: event.closes,
        closed: event.closed,
        url: event.registerUrl,
        note: event.type === 'Hackathon' ? 'One registration per team. The leader fills this in for everyone.' : undefined,
      }
    : null,
}))
