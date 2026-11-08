import amazon from '@/assets/partners/amazon.svg'
import github from '@/assets/partners/github.svg'
import google from '@/assets/partners/google.svg'
import ibm from '@/assets/partners/ibm.svg'
import intel from '@/assets/partners/intel.svg'
import meta from '@/assets/partners/meta.svg'
import microsoft from '@/assets/partners/microsoft.svg'
import netflix from '@/assets/partners/netflix.svg'
import nvidia from '@/assets/partners/nvidia.svg'
import samsung from '@/assets/partners/samsung.svg'
import spotify from '@/assets/partners/spotify.svg'
import stripe from '@/assets/partners/stripe.svg'

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

function LogoRow({ hidden = false }) {
  return (
    <ul className="flex shrink-0 items-center gap-16 pr-16 sm:gap-24 sm:pr-24" aria-hidden={hidden || undefined}>
      {PARTNERS.map(partner => (
        <li key={partner.name} className="flex h-7 shrink-0 items-center sm:h-9">
          <img
            src={partner.src}
            alt={hidden ? '' : partner.name}
            draggable="false"
            style={{ height: `${(partner.scale ?? 1) * 100}%` }}
            // Every wordmark is flattened to white so the strip reads as one set.
            className="w-auto opacity-60 brightness-0 invert transition-opacity duration-300 hover:opacity-100"
          />
        </li>
      ))}
    </ul>
  )
}

// Logos scroll right to left in an endless loop. The row is rendered twice side
// by side and the track slides by exactly one row's width, so the seam never shows.
export default function PartnersMarquee() {
  return (
    // Vertical padding leaves room for logos scaled taller than the row, so the
    // horizontal clipping doesn't cut off their tops and bottoms.
    <div className="partners-marquee relative overflow-hidden py-6">
      <div className="partners-marquee-track flex w-max">
        <LogoRow />
        <LogoRow hidden />
      </div>
    </div>
  )
}
