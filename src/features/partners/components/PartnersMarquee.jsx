import amazon from '@/assets/images/partners/amazon.svg'
import github from '@/assets/images/partners/github.svg'
import google from '@/assets/images/partners/google.svg'
import ibm from '@/assets/images/partners/ibm.svg'
import intel from '@/assets/images/partners/intel.svg'
import meta from '@/assets/images/partners/meta.svg'
import microsoft from '@/assets/images/partners/microsoft.svg'
import netflix from '@/assets/images/partners/netflix.svg'
import nvidia from '@/assets/images/partners/nvidia.svg'
import samsung from '@/assets/images/partners/samsung.svg'
import spotify from '@/assets/images/partners/spotify.svg'
import stripe from '@/assets/images/partners/stripe.svg'

// Placeholder partner wordmarks (well-known brands, SVGs from Wikimedia Commons).
// Swap these for the club's real partners. `scale` evens out logos whose
// artwork is visually smaller or larger than the rest at the same height.
const PARTNERS = [
  { name: 'Google', src: google },
  { name: 'Microsoft', src: microsoft },
  { name: 'Amazon', src: amazon, scale: 1.1 },
  { name: 'Meta', src: meta },
  { name: 'Netflix', src: netflix, scale: 0.85 },
  { name: 'Spotify', src: spotify },
  { name: 'NVIDIA', src: nvidia, scale: 0.8 },
  { name: 'GitHub', src: github, scale: 0.9 },
  { name: 'Stripe', src: stripe, scale: 1.2 },
  { name: 'Intel', src: intel, scale: 1.2 },
  { name: 'IBM', src: ibm },
  { name: 'Samsung', src: samsung, scale: 1.5 },
]

// Every wordmark is flattened to one colour so the strip reads as one set:
// white for dark backgrounds, or near-black ink for light ones.
const TONES = {
  light: 'opacity-60 brightness-0 invert hover:opacity-100',
  dark: 'opacity-80 brightness-0 hover:opacity-100',
}

function LogoRow({ hidden = false, tone }) {
  return (
    <ul className="flex shrink-0 items-center gap-16 pr-16 sm:gap-24 sm:pr-24" aria-hidden={hidden || undefined}>
      {PARTNERS.map(partner => (
        <li key={partner.name} className="flex h-7 shrink-0 items-center sm:h-9">
          <img
            src={partner.src}
            alt={hidden ? '' : partner.name}
            draggable="false"
            style={{ height: `${(partner.scale ?? 1) * 100}%` }}
            className={`w-auto transition-opacity duration-300 ${TONES[tone]}`}
          />
        </li>
      ))}
    </ul>
  )
}

// Logos scroll right to left in an endless loop. The row is rendered twice side
// by side and the track slides by exactly one row's width, so the seam never shows.
// tone: "light" (white logos, for dark backgrounds) or "dark" (ink logos, for light ones).
export default function PartnersMarquee({ tone = 'light' }) {
  return (
    // Vertical padding leaves room for logos scaled taller than the row, so the
    // horizontal clipping doesn't cut off their tops and bottoms.
    <div className="partners-marquee relative overflow-hidden py-6">
      <div className="partners-marquee-track flex w-max">
        <LogoRow tone={tone} />
        <LogoRow hidden tone={tone} />
      </div>
    </div>
  )
}
