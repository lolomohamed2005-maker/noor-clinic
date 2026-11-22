import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { departments } from '../../lib/departments'
import { useSiteSettings } from '../../hooks/useSiteSettings'
import { whatsappLink } from './WhatsAppButton'

export function Footer() {
  const { settings } = useSiteSettings()
  const whatsapp = settings.whatsapp_number
  const email = settings.contact_email
  const phone = settings.phone_number
  const address = settings.address
  const hours = settings.working_hours

  return (
    <footer className="bg-forest-dark text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-4xl tracking-[0.16em]">NOOR</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
            Specialist doctors, modern equipment and short waiting times. Book your appointment online in less than a
            minute and walk in with a confirmed time.
          </p>
          <Link
            to="/book"
            className="mt-6 inline-block rounded-full bg-clay px-7 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
          >
            Book appointment
          </Link>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-moss-light">Departments</p>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            {departments.map((item) => (
              <li key={item.value}>
                <Link to={`/doctors/${item.value}`} className="hover:text-clay">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-moss-light">Contact</p>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            {phone && (
              <li className="flex items-center gap-2">
                <Phone size={14} />
                <a href={`tel:${phone}`} className="hover:text-clay">
                  {phone}
                </a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a
                  href={whatsappLink(whatsapp, 'Hello, I would like to ask about an appointment.')}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-clay"
                >
                  WhatsApp: {whatsapp}
                </a>
              </li>
            )}
            {email && (
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <a href={`mailto:${email}`} className="hover:text-clay">
                  {email}
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                {address}
              </li>
            )}
            {hours && (
              <li className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 shrink-0" />
                {hours}
              </li>
            )}
            {!phone && !whatsapp && !email && !address && <li>Contact details coming soon.</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 px-6 py-5 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Noor Medical Center. All rights reserved.
      </div>
    </footer>
  )
}
