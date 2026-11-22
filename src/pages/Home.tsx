import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'
import { ArrowRight, CalendarCheck, Clock, HeartPulse, ShieldCheck, Stethoscope, UserRound } from 'lucide-react'
import { useDoctors } from '../hooks/useDoctors'
import { useSiteSettings } from '../hooks/useSiteSettings'
import { DoctorCard } from '../components/doctor/DoctorCard'
import { Reveal } from '../components/ui/Reveal'
import { Counter } from '../components/ui/Counter'
import { Magnetic } from '../components/ui/Magnetic'
import { ParallaxImage } from '../components/ui/ParallaxImage'
import { EcgLine } from '../components/ui/EcgLine'
import { alreadyShown } from '../components/ui/Preloader'
import { departments } from '../lib/departments'
import { resolveSiteImage } from '../lib/siteImages'
import type { DoctorRow } from '../types/database'

const ease = [0.22, 1, 0.36, 1] as const

const howSteps = [
  { icon: UserRound, title: 'Choose your doctor', text: 'Pick a department and browse specialists with their experience and fees.' },
  { icon: CalendarCheck, title: 'Pick a time', text: 'See real free times and book the one that suits you. Taken slots disappear instantly.' },
  { icon: Stethoscope, title: 'Walk in and be seen', text: 'Arrive a few minutes early. No long waiting rooms, no surprises.' },
]

const features = [
  { icon: ShieldCheck, title: 'Clear fees', text: 'The consultation fee is shown before you book.' },
  { icon: Clock, title: 'Short waiting', text: 'Confirmed time slots mean you are seen close to your appointment.' },
  { icon: HeartPulse, title: 'Modern equipment', text: 'Diagnostics and treatment rooms that are equipped for accurate care.' },
]

function Marquee({ words, slow = false, outline = false }: { words: string[]; slow?: boolean; outline?: boolean }) {
  const row = [...words, ...words]
  return (
    <div className="overflow-hidden whitespace-nowrap py-2">
      <div className={`inline-flex ${slow ? 'animate-marquee-slow' : 'animate-marquee'}`}>
        {row.map((word, index) => (
          <span key={`${word}-${index}`} className={`mx-6 font-display text-6xl italic md:text-8xl ${outline ? 'text-outline' : ''}`}>
            {word}
            <span className="mx-6 not-italic text-clay">+</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function FloatCard({
  children,
  className,
  depth,
  delay,
  mx,
  my,
}: {
  children: React.ReactNode
  className: string
  depth: number
  delay: number
  mx: MotionValue<number>
  my: MotionValue<number>
}) {
  const x = useTransform(mx, (value) => value * depth)
  const y = useTransform(my, (value) => value * depth)

  return (
    <motion.div style={{ x, y }} className={`absolute ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay, ease }}
      >
        <div className="animate-float" style={{ animationDelay: `${delay}s` }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Showcase({ items }: { items: DoctorRow[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  useLayoutEffect(() => {
    function measure() {
      if (!trackRef.current) return
      setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [items.length])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])

  return (
    <section ref={sectionRef} className="relative bg-sand" style={{ height: `${Math.max(220, 100 + distance / 6)}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 w-full max-w-7xl px-6">
          <p className="text-[11px] uppercase tracking-[0.4em] text-clay">Our specialists</p>
          <h2 className="mt-3 text-5xl text-forest md:text-6xl">Doctors you can trust</h2>
        </div>
        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-8 px-6 md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {items.map((doctor, index) => (
            <div key={doctor.id} className="w-[250px] shrink-0 md:w-[290px]">
              <DoctorCard doctor={doctor} index={index} />
            </div>
          ))}
          <Link to="/doctors" className="flex w-[250px] shrink-0 items-center justify-center md:w-[290px]">
            <span className="flex items-center gap-3 font-display text-4xl italic text-forest">
              Meet everyone <ArrowRight />
            </span>
          </Link>
        </motion.div>
        <div className="mx-auto mt-10 h-px w-full max-w-7xl bg-forest/15">
          <motion.div style={{ scaleX: scrollYProgress }} className="h-px origin-left bg-clay" />
        </div>
      </div>
    </section>
  )
}

export function Home() {
  const { settings } = useSiteSettings()
  const { doctors } = useDoctors({})
  const navigate = useNavigate()
  const [department, setDepartment] = useState('')
  const [base] = useState(() => (alreadyShown() ? 0.1 : 2.6))

  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 })
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 })

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imageY = useTransform(heroProgress, [0, 1], ['0%', '14%'])
  const textY = useTransform(heroProgress, [0, 1], ['0%', '-18%'])

  const howRef = useRef<HTMLElement>(null)
  const { scrollYProgress: howProgress } = useScroll({ target: howRef, offset: ['start 70%', 'end 60%'] })

  function handleHeroMove(event: React.PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    mx.set(((event.clientX - rect.left) / rect.width - 0.5) * 40)
    my.set(((event.clientY - rect.top) / rect.height - 0.5) * 30)
  }

  const featuredOnly = doctors.filter((doctor) => doctor.is_featured)
  const showcase = (featuredOnly.length > 0 ? featuredOnly : doctors).slice(0, 8)
  const phone = settings.phone_number

  const headline = ['Care', 'that', 'feels', 'like', 'home.']

  return (
    <div className="bg-cream text-ink">
      <section
        ref={heroRef}
        onPointerMove={handleHeroMove}
        className="relative overflow-hidden pt-[72px]"
      >
        <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
          <motion.div style={{ y: textY }}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: base, ease }}
              className="text-[11px] uppercase tracking-[0.4em] text-clay"
            >
              Noor Medical Center
            </motion.p>
            <h1 className="mt-6 text-6xl leading-[0.98] text-forest md:text-7xl lg:text-[6.4rem]">
              {headline.map((word, index) => (
                <span key={word} className="mr-4 inline-block overflow-hidden pb-2 align-bottom">
                  <motion.span
                    className={`inline-block ${index === 2 ? 'italic text-moss' : ''}`}
                    initial={{ y: '115%', rotate: 5 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{ duration: 1.1, delay: base + index * 0.1, ease }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: base + 0.7 }}
              className="mt-8 max-w-md text-base leading-relaxed text-ink/65"
            >
              Specialist doctors, modern equipment and short waiting times. Book your appointment online in less than a minute.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: base + 0.9, ease }}
              onSubmit={(event) => {
                event.preventDefault()
                navigate(department ? `/book?department=${department}` : '/book')
              }}
              className="mt-10 flex max-w-lg flex-col gap-3 rounded-3xl bg-white p-3 shadow-[0_30px_60px_-30px_rgba(6,50,59,0.35)] ring-1 ring-line sm:flex-row"
            >
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                aria-label="Department"
                className="flex-1 rounded-2xl bg-sand px-5 py-3.5 text-sm outline-none"
              >
                <option value="">Any department</option>
                {departments.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="flex items-center justify-center gap-2 rounded-2xl bg-clay px-7 py-3.5 text-sm font-medium text-white">
                Find a time <ArrowRight size={16} />
              </button>
            </motion.form>
          </motion.div>

          <div className="relative mx-auto h-[540px] w-full max-w-[540px] lg:h-[640px]">
            <motion.div
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 1.4, delay: base, ease }}
              className="absolute inset-x-6 bottom-0 top-8 overflow-hidden rounded-t-[999px] bg-sand"
            >
              <motion.img
                src={resolveSiteImage(settings, 'hero_image')}
                alt="Doctor talking with a patient"
                style={{ y: imageY, scale: 1.15 }}
                className="h-full w-full object-cover"
              />
            </motion.div>

            <FloatCard className="-left-2 top-24 sm:-left-8" depth={-1.2} delay={base + 0.9} mx={mx} my={my}>
              <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 shadow-xl ring-1 ring-line backdrop-blur">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-moss text-white">
                  <CalendarCheck size={20} />
                </span>
                <div>
                  <p className="text-sm font-medium text-forest">Same-day booking</p>
                  <p className="text-xs text-ink/50">Free times updated live</p>
                </div>
              </div>
            </FloatCard>

            <FloatCard className="-right-2 bottom-28 sm:-right-6" depth={1.4} delay={base + 1.1} mx={mx} my={my}>
              <div className="flex items-center gap-3 rounded-2xl bg-forest p-4 text-cream shadow-xl">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-clay">
                  <span className="animate-pulse-ring absolute inset-0 rounded-full bg-clay" />
                  <HeartPulse size={20} className="relative" />
                </span>
                <div>
                  <p className="text-sm font-medium">Emergency line</p>
                  <p className="text-xs text-cream/60">{phone || 'Open 24 hours'}</p>
                </div>
              </div>
            </FloatCard>

            <FloatCard className="bottom-4 left-0 hidden sm:block" depth={0.7} delay={base + 1.3} mx={mx} my={my}>
              <img
                src={resolveSiteImage(settings, 'hero_card_image')}
                alt=""
                className="h-28 w-28 rounded-full border-4 border-cream object-cover shadow-xl"
              />
            </FloatCard>
          </div>
        </div>

        <EcgLine className="pointer-events-none absolute inset-x-0 bottom-0 h-20 w-full text-moss/40" />
      </section>

      <section className="overflow-hidden border-y border-line py-6 text-forest">
        <div className="-rotate-1">
          <Marquee words={departments.map((item) => item.label)} />
        </div>
        <div className="rotate-1 text-forest/60">
          <Marquee words={['Care', 'Trust', 'Precision', 'Comfort']} slow outline />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.4em] text-clay">Departments</p>
          <h2 className="mt-3 text-5xl text-forest md:text-6xl">Complete care under one roof</h2>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((item, index) => (
            <Reveal key={item.value} delay={(index % 3) * 0.1}>
              <Link to={`/doctors/${item.value}`} className="group relative block h-[380px] overflow-hidden rounded-3xl">
                <img
                  src={resolveSiteImage(settings, item.imageKey)}
                  alt={item.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/90 via-forest-dark/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-cream">
                  <item.icon size={26} strokeWidth={1.5} className="text-moss-light" />
                  <p className="mt-3 font-display text-4xl">{item.label}</p>
                  <p className="mt-1 max-h-0 overflow-hidden text-sm text-cream/80 opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:opacity-100">
                    {item.note}
                  </p>
                </div>
                <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-cream text-forest opacity-0 transition-all duration-500 group-hover:opacity-100">
                  <ArrowRight size={18} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Showcase items={showcase} />

      <section ref={howRef} className="mx-auto max-w-7xl px-6 py-28">
        <Reveal>
          <p className="text-[11px] uppercase tracking-[0.4em] text-clay">How it works</p>
          <h2 className="mt-3 text-5xl text-forest md:text-6xl">Three steps to your visit</h2>
        </Reveal>
        <div className="relative mt-16 grid gap-12 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-line md:block">
            <motion.div style={{ scaleX: howProgress }} className="h-px origin-left bg-clay" />
          </div>
          {howSteps.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.15}>
              <div className="relative text-center">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest text-cream">
                  <item.icon size={26} strokeWidth={1.5} />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-clay text-xs text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl text-forest">{item.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink/60">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-forest-dark py-28 text-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
          <Reveal>
            <ParallaxImage
              src={resolveSiteImage(settings, 'about_image')}
              alt="Inside the medical center"
              className="h-[520px] rounded-t-[999px]"
            />
          </Reveal>
          <div>
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.4em] text-moss-light">Why Noor</p>
              <h2 className="mt-3 text-5xl md:text-6xl">Medicine, made calm</h2>
            </Reveal>
            <div className="mt-10 space-y-7">
              {features.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.12}>
                  <div className="flex gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream/10">
                      <item.icon size={22} strokeWidth={1.5} className="text-moss-light" />
                    </span>
                    <div>
                      <h3 className="text-2xl">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-cream/65">{item.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-cream/15 pt-8">
              <Reveal>
                <p className="font-display text-5xl"><Counter to={6} /></p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-cream/50">Departments</p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="font-display text-5xl"><Counter to={Math.max(doctors.length, 8)} suffix="+" /></p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-cream/50">Specialists</p>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="font-display text-5xl"><Counter to={24} suffix="/7" /></p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-cream/50">Emergency</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
          <ParallaxImage src={resolveSiteImage(settings, 'cta_image')} alt="Modern hospital corridor" className="h-[460px]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-forest-dark/65 px-6 text-center text-cream">
            <h2 className="text-5xl md:text-7xl">Your health cannot wait</h2>
            <p className="mt-4 max-w-md text-cream/75">Book in under a minute and get a confirmed time with the right specialist.</p>
            <Magnetic className="mt-8 inline-block">
              <Link to="/book" className="rounded-full bg-clay px-10 py-4 text-sm font-medium text-white">
                Book appointment
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  )
}
