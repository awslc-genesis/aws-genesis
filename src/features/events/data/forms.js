// Registration forms for events/events.js. A form is a list of steps, and each
// step is a list of questions; the page shows one step at a time with tabs
// (01 Setup, 02 Eligibility…) and always ends with a Review step of its own.
//
// Use a ready-made one, or write your own steps:
//
//   form: [
//     { title: 'Your details', intro: 'Optional line under the title.', fields: [
//         { name: 'name', label: 'Full name', type: 'text' },
//         { name: 'tshirt', label: 'Shirt size', type: 'choice', options: ['S', 'M', 'L'] },
//     ] },
//   ]
//
// Question fields
//   name       Unique key within the form (letters, no spaces).
//   label      The question, also used as the column heading in Google Sheets.
//   type       'text' | 'email' | 'tel' | 'textarea' | 'choice' (one of a few
//              short options) | 'cards' (big tiles with a hint line) |
//              'check' (a box to tick, e.g. an agreement) | 'members' (one set
//              of questions per team member) | 'note' (text only, no answer).
//   options    For choice and cards: strings, or { value, hint, size } for cards.
//   required   Defaults to true.
//   hint       Small grey line under the question.
//   wide       true to span both columns.
//   showIf     values => boolean, to ask only in some cases.
//   text       For note: a string, or values => string.
//
// Members: { type: 'members', name, countFrom: '<cards field>', fields: [...] }
// asks `fields` once per member; the count is the `size` of the option picked
// in `countFrom`. A member field with `leaderOnly: true` is asked of member 1 only.
//
// Every form needs an email question (or an email among the member questions):
// it's how the sheet limits repeat sign-ups.
//
// When you change questions after people have registered, the Google Sheet
// simply gets new columns; old rows keep their answers.

const DEFAULT_TEAM_SIZES = [
  { value: 'Solo', hint: '1 person', size: 1 },
  { value: 'Duo', hint: '2 people', size: 2 },
  { value: 'Trio', hint: '3 people', size: 3 },
  { value: 'Full team', hint: '5 people', size: 5 },
]

const DEFAULT_TRACKS = [
  { value: 'Education & Digital Literacy', hint: 'Learning that reaches more people' },
  { value: 'Sustainability & Climate', hint: 'Less waste, cleaner cities' },
  { value: 'Health & Well-being', hint: 'Care, access and mental health' },
  { value: 'Civic Innovation & Public Service', hint: 'Better services for citizens' },
  { value: 'Economic Empowerment', hint: 'Jobs, small business and finance' },
]

const DEFAULT_FORMATS = [
  { value: 'Web app', hint: 'Runs in the browser' },
  { value: 'Mobile app', hint: 'Android or iOS' },
  { value: 'AI & data', hint: 'Models, analytics, chatbots' },
  { value: 'IoT & hardware', hint: 'Sensors and devices' },
]

const DEFAULT_RULES = [
  'Every member is currently enrolled in a college or university.',
  'Every member is 18 or older, or has a parent or guardian’s consent to join.',
  'We have read and agree to the event rules and code of conduct.',
  'We agree that photos and videos taken during the event may be shared by Genesis.',
]

const YEAR_LEVELS = ['1st', '2nd', '3rd', '4th', '5th']

// One person signing up: for webinars, seminars, workshops and talks.
// `extra` adds questions before the final agreement.
export function basicForm({ title = 'Your details', extra = [] } = {}) {
  return [
    {
      title,
      fields: [
        { name: 'name', label: 'Full name', type: 'text', autoComplete: 'name' },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'school', label: 'School or organization', type: 'text', autoComplete: 'organization' },
        { name: 'course', label: 'Course and year', type: 'text', required: false, hint: 'e.g. BSIT 2nd year' },
        { name: 'member', label: 'Are you a Genesis member?', type: 'choice', options: ['Yes', 'Not yet'], wide: true },
        ...extra,
        { name: 'questions', label: 'Anything you want us to cover?', type: 'textarea', required: false, wide: true },
        {
          name: 'consent',
          label: 'Genesis may email me about this event.',
          type: 'check',
          wide: true,
        },
      ],
    },
  ]
}

// A team event with tracks, eligibility, members and an optional fee.
// Everything has a default; pass only what this hackathon does differently.
// `fee` is per member, in pesos; leave it out (or 0) for a free event and the
// Payment step disappears.
export function hackathonForm({
  teamSizes = DEFAULT_TEAM_SIZES,
  tracks = DEFAULT_TRACKS,
  formats = DEFAULT_FORMATS,
  rules = DEFAULT_RULES,
  fee = 0,
  payment = {},
} = {}) {
  const sizeOf = values => teamSizes.find(option => option.value === values.teamSize)?.size ?? 1
  const steps = [
    {
      title: 'Setup',
      intro: 'Choose how you’re joining, then pick 1 impact track and 1 technology format.',
      fields: [
        { name: 'teamSize', label: 'Join as', type: 'cards', options: teamSizes, wide: true },
        {
          name: 'teamName',
          label: 'Team name',
          type: 'text',
          wide: true,
          showIf: values => sizeOf(values) > 1,
        },
        { name: 'track', label: 'Impact track', type: 'cards', options: tracks, wide: true },
        { name: 'format', label: 'Technology format', type: 'cards', options: formats, wide: true },
      ],
    },
    {
      title: 'Eligibility',
      intro: 'Tick each one to confirm it is true for everyone on the team.',
      fields: rules.map((rule, i) => ({ name: `rule${i + 1}`, label: rule, type: 'check', wide: true })),
    },
    {
      title: 'Members',
      intro: 'Member 1 is the team leader and our contact for everything about the event.',
      fields: [
        {
          name: 'members',
          type: 'members',
          countFrom: 'teamSize',
          fields: [
            { name: 'name', label: 'Full name', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'school', label: 'School', type: 'text' },
            { name: 'course', label: 'Course', type: 'text', hint: 'e.g. BS Computer Science' },
            { name: 'year', label: 'Year level', type: 'choice', options: YEAR_LEVELS, wide: true },
            { name: 'phone', label: 'Mobile number', type: 'tel', leaderOnly: true, autoComplete: 'tel' },
          ],
        },
      ],
    },
  ]

  if (fee > 0) {
    steps.push({
      title: 'Payment',
      fields: [
        {
          name: 'paymentNote',
          type: 'note',
          wide: true,
          text: values => {
            const people = sizeOf(values)
            const total = `₱${(fee * people).toLocaleString('en-PH')}`
            const line = `Total: ${total} (₱${fee.toLocaleString('en-PH')} × ${people} ${people === 1 ? 'member' : 'members'}).`
            return payment.instructions ? `${line} ${payment.instructions}` : line
          },
        },
        { name: 'payer', label: 'Name on the payment', type: 'text' },
        { name: 'reference', label: 'Reference number', type: 'text', hint: 'From your GCash or bank receipt' },
      ],
    })
  }

  return steps
}
