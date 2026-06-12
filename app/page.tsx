import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";
import { ACCENT_ON, type AccentColor } from "@/components/colors";
import {
  Squiggle, Loops, Sparkle, Ring, DottedArc, Dots, ProgressRing,
} from "@/components/landing/Deco";

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="relative inline-block rounded-2xl bg-warm/40 px-2.5 text-ink">{children}</span>;
}
function Blue({ children }: { children: React.ReactNode }) {
  return <span className="text-brand">{children}</span>;
}

const FUNCIONES: { icon: string; color: AccentColor; title: string; text: string; featured?: boolean }[] = [
  { icon: "Megaphone", color: "news", title: "Novedades", text: "Avisos del colegio con foto, likes y comentarios, segmentados por curso.", featured: true },
  { icon: "CalendarDays", color: "brand", title: "Calendario", text: "Exámenes, eventos y vacaciones en un calendario claro y compartido." },
  { icon: "MessagesSquare", color: "sky", title: "Mensajes", text: "Conversaciones entre familias y docentes, siempre dentro de cada salón." },
  { icon: "ClipboardList", color: "requests", title: "Trámites", text: "Inasistencias, autorizaciones y comprobantes, sin papeles." },
  { icon: "FolderClosed", color: "docs", title: "Documentos", text: "Boletines, circulares y protocolos ordenados y a un clic." },
  { icon: "Bus", color: "transport", title: "Transporte", text: "Seguimiento del camión escolar en vivo y avisos de subida y bajada." },
];

const VALORES = [
  { icon: "ShieldCheck", title: "Privacidad", text: "Cada familia ve solo lo de sus hijos. Datos protegidos por diseño." },
  { icon: "Smile", title: "Cercanía", text: "Una herramienta simple que cualquiera usa desde el primer día." },
  { icon: "Zap", title: "Claridad", text: "La información importante llega y se lee. Sin grupos de chat caóticos." },
  { icon: "Languages", title: "Multi-idioma", text: "Español, portugués y términos de cada país, listos para escalar." },
];

const ROLES: { tag: string; color: AccentColor; title: string; text: string; meta: string[]; img: string }[] = [
  { tag: "Dirección", color: "brand", title: "Para el equipo directivo", text: "Comunica a toda la comunidad, mide qué se lee y mantén todo ordenado en un solo lugar.", meta: ["Avisos masivos", "Métricas de lectura", "Multi-nivel"], img: "https://picsum.photos/seed/cqrole1/520/360" },
  { tag: "Docentes", color: "sky", title: "Para los docentes", text: "Habla con las familias de tu salón, comparte tareas y eventos en segundos.", meta: ["Mensajes por salón", "Calendario", "Trámites"], img: "https://picsum.photos/seed/cqrole2/520/360" },
  { tag: "Familias", color: "news", title: "Para las familias", text: "Entérate de todo, resuelve trámites y sigue el día a día de tus hijos.", meta: ["Novedades", "Autorizaciones", "Transporte"], img: "https://picsum.photos/seed/cqrole3/520/360" },
];

const PLANES: { name: string; price: string; period: string; desc: string; features: string[]; featured?: boolean }[] = [
  { name: "Demo", price: "$0", period: "para probar", desc: "Para conocer Colequium con un grupo piloto del colegio.", features: ["Hasta 1 salón", "Novedades y calendario", "Soporte por correo"] },
  { name: "Escuela", price: "$XX", period: "por mes", desc: "Para colegios que quieren todo conectado.", features: ["Salones ilimitados", "Mensajes y trámites", "Multi-idioma", "Soporte prioritario"], featured: true },
  { name: "Institución", price: "A medida", period: "varios colegios", desc: "Para redes y grupos educativos.", features: ["Todo lo de Escuela", "Transporte en vivo", "Integraciones", "Gestor dedicado"] },
];

const PASOS = [
  { icon: "Phone", title: "Agenda una demo", text: "Te mostramos Colequium con datos de tu colegio." },
  { icon: "Settings", title: "Configuramos todo", text: "Cargamos niveles, salones y roles por ti." },
  { icon: "Users", title: "Invita a la comunidad", text: "Familias y docentes entran por invitación." },
  { icon: "Sparkles", title: "A comunicarse", text: "Todo el colegio, conectado desde el día uno." },
];

const RECURSOS = [
  { tag: "Comunidad", title: "5 ideas para que las familias lean tus avisos", date: "10 jun 2026", img: "https://picsum.photos/seed/cqblog1/640/440" },
  { tag: "Gestión", title: "Cómo organizar el calendario escolar del trimestre", date: "03 jun 2026", img: "https://picsum.photos/seed/cqblog2/440/280" },
  { tag: "Tecnología", title: "Adiós a los grupos de WhatsApp del colegio", date: "28 may 2026", img: "https://picsum.photos/seed/cqblog3/440/280" },
];

const FAQS = [
  { q: "¿Cómo entran las familias y los docentes?", a: "Por invitación del colegio. El equipo directivo carga o invita a cada persona, así nadie ajeno accede a la comunidad." },
  { q: "¿Las familias ven información de otros salones?", a: "No. Cada familia ve únicamente lo de los salones de sus hijos. La privacidad está garantizada a nivel de la base de datos." },
  { q: "¿Sirve para colegios de otros países?", a: "Sí. Colequium está pensado para LatAm y Brasil: idioma y términos regionales se adaptan a cada país." },
  { q: "¿Necesitamos instalar algo?", a: "No. Funciona desde el navegador y, más adelante, con apps para Android e iOS. La configuración la hacemos nosotros." },
];

function Badge({ children, on = "light" }: { children: React.ReactNode; on?: "light" | "warm" | "dark" }) {
  const cls = on === "warm" ? "bg-white text-cta" : on === "dark" ? "bg-white/15 text-white" : "bg-brand/10 text-brand";
  return <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-800 ${cls}`}>{children}</span>;
}

export default function Landing() {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Wordmark />
          <ul className="hidden items-center gap-8 text-sm font-700 text-ink/70 md:flex">
            <li><a href="#funciones" className="transition-colors hover:text-brand">Funciones</a></li>
            <li><a href="#planes" className="transition-colors hover:text-brand">Planes</a></li>
            <li><a href="#recursos" className="transition-colors hover:text-brand">Recursos</a></li>
            <li><a href="#contacto" className="transition-colors hover:text-brand">Contacto</a></li>
          </ul>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-full px-4 py-2.5 text-sm font-800 text-ink transition-colors hover:bg-white sm:block">Ingresar</Link>
            <a href="#contacto" className="rounded-full bg-cta px-5 py-2.5 text-sm font-800 text-white shadow-soft transition-colors hover:bg-cta-deep">Solicitar demo</a>
          </div>
        </nav>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <Loops className="left-[42%] top-6 h-24 w-36 text-brand/30" />
        <Sparkle className="left-[38%] top-40 h-8 w-8 text-cta" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-14 pt-10 lg:grid-cols-2 lg:pb-24 lg:pt-16">
          <div className="relative z-10">
            <Badge>Plataforma de comunicación escolar</Badge>
            <h1 className="mt-6 font-display text-4xl font-800 leading-[1.08] text-ink sm:text-5xl lg:text-[3.7rem]">
              <Mark>Conecta</Mark> a tu colegio con las familias <Blue>como nunca</Blue>
            </h1>
            <p className="mt-5 max-w-lg text-lg font-500 leading-relaxed text-ink/65">
              Novedades, calendario, mensajes y trámites entre el colegio, las
              familias y los docentes. Claro, ordenado y en el idioma de cada país.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#contacto" className="flex items-center justify-center gap-2 rounded-full bg-cta px-7 py-4 text-base font-800 text-white shadow-soft transition-colors hover:bg-cta-deep">
                Empieza hoy <Icon name="ArrowRight" className="h-5 w-5" />
              </a>
              <a href="#funciones" className="flex items-center justify-center gap-2 rounded-full border-2 border-ink/10 bg-white px-7 py-4 text-base font-800 text-ink transition-colors hover:border-brand/40 hover:text-brand">
                Ver funciones
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-2 gap-6">
              <div><dt className="font-display text-3xl font-800 text-ink">+120</dt><dd className="text-sm font-600 text-ink/55">Colegios conectados</dd></div>
              <div><dt className="font-display text-3xl font-800 text-ink">98%</dt><dd className="text-sm font-600 text-ink/55">Avisos leídos</dd></div>
            </dl>
          </div>

          <div className="relative">
            <Ring className="-right-2 top-2 h-20 w-20 text-cta/30" />
            <DottedArc className="-bottom-6 -left-4 h-24 w-24 text-brand/40" />
            <div className="relative overflow-hidden rounded-[2.5rem_4rem_2.5rem_4rem] border-4 border-white bg-white shadow-pop">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://picsum.photos/seed/cqhero3/720/680" alt="Comunidad escolar" className="aspect-[5/6] w-full object-cover" />
            </div>
            <div className="absolute left-3 top-6 flex items-center gap-2.5 rounded-3xl border border-ink/5 bg-white p-3 shadow-card">
              <span className="relative grid h-12 w-12 place-items-center">
                <ProgressRing value={98} className="h-12 w-12" />
                <span className="absolute font-display text-[11px] font-800 text-ink">98%</span>
              </span>
              <span className="text-xs font-700 leading-tight text-ink">Avisos<br />leídos</span>
            </div>
            <div className="absolute -bottom-3 right-3 flex items-center gap-3 rounded-3xl border border-ink/5 bg-white p-3 shadow-card">
              <span className="flex -space-x-2">
                {["cqa1", "cqa2", "cqa3"].map((s) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={s} src={`https://picsum.photos/seed/${s}/40/40`} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                ))}
              </span>
              <span className="text-xs font-700 leading-tight text-ink">+30,000<br />familias</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Logos ===== */}
      <section className="mx-auto max-w-6xl px-5 py-6">
        <p className="text-center text-sm font-700 text-ink/45">Colegios de toda Latinoamérica confían en Colequium</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {["Colegio Las Lomas", "Instituto del Sol", "Colegio San Marcos", "Liceo Norte", "Escuela Río"].map((n) => (
            <span key={n} className="font-display text-lg font-800 text-ink/35">{n}</span>
          ))}
        </div>
      </section>

      {/* ===== Funciones (bloque naranja) ===== */}
      <section id="funciones" className="relative overflow-hidden bg-warm py-16 sm:py-24">
        <Loops className="right-6 top-8 h-24 w-36 text-white/40" />
        <Dots className="left-8 bottom-10 h-20 w-20 text-ink/15" />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <Badge on="warm">Funciones</Badge>
            <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">
              Todo lo del colegio, <Blue>en un solo lugar</Blue>
            </h2>
            <p className="mt-3 font-500 text-ink/70">Seis módulos que reemplazan los grupos de chat, los papeles y los mails perdidos.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FUNCIONES.map((f) => (
              <div key={f.title} className={`group rounded-[1.75rem] p-6 shadow-card transition-transform hover:-translate-y-1 ${f.featured ? "bg-ink text-white" : "bg-white"}`}>
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${f.featured ? "bg-cta text-white" : ACCENT_ON[f.color]}`}>
                  <Icon name={f.icon} className="h-7 w-7" />
                </span>
                <h3 className={`mt-5 font-display text-xl font-800 ${f.featured ? "text-white" : "text-ink"}`}>{f.title}</h3>
                <p className={`mt-2 text-sm font-500 leading-relaxed ${f.featured ? "text-white/70" : "text-ink/60"}`}>{f.text}</p>
                <span className={`mt-4 inline-grid h-8 w-8 place-items-center rounded-full transition-colors ${f.featured ? "bg-white/15 text-white" : "bg-ink/5 text-ink/50 group-hover:bg-cta group-hover:text-white"}`}>
                  <Icon name="ArrowRight" className="h-4 w-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Sobre Colequium ===== */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div className="relative">
            <Sparkle className="-left-3 -top-3 h-10 w-10 text-cta" />
            <Dots className="-right-2 bottom-8 h-16 w-16 text-brand/30" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://picsum.photos/seed/cqabout2/640/520" alt="" className="aspect-[6/5] w-full rounded-[2.5rem_2.5rem_4rem_2.5rem] object-cover shadow-card" />
            <div className="absolute -bottom-5 -right-3 rounded-3xl border border-ink/5 bg-white p-4 shadow-pop">
              <p className="font-display text-2xl font-800 text-brand">+5 años</p>
              <p className="text-xs font-600 text-ink/55">acompañando colegios</p>
            </div>
          </div>
          <div>
            <Badge>Sobre Colequium</Badge>
            <h2 className="mt-4 font-display text-3xl font-800 leading-tight text-ink sm:text-4xl">
              Comunicación <Blue>clara</Blue> para toda la comunidad
            </h2>
            <p className="mt-4 font-500 text-ink/65">
              Reconstruimos, con tecnología y diseño modernos, la forma en que el
              colegio habla con las familias. Menos ruido, más claridad, y la
              información importante siempre a mano.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {["Una sola app para avisos, calendario, mensajes y trámites", "Pensado para directivos, docentes y familias", "Listo para crecer a varios países e idiomas"].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm font-600 text-ink/75">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-white"><Icon name="Check" className="h-3 w-3" /></span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Valores ===== */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <Squiggle className="left-0 -top-2 h-12 w-28 text-cta/60" />
            <Badge>Nuestros valores</Badge>
            <h2 className="mt-4 font-display text-3xl font-800 leading-tight text-ink sm:text-4xl">En qué <Blue>creemos</Blue></h2>
            <p className="mt-4 max-w-md font-500 text-ink/65">Cada decisión de producto pasa por estos cuatro principios.</p>
          </div>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
            {VALORES.map((v) => (
              <div key={v.title}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cta/15 text-cta"><Icon name={v.icon} className="h-6 w-6" /></span>
                <h3 className="mt-4 font-display text-lg font-800 text-ink">{v.title}</h3>
                <p className="mt-1.5 text-sm font-500 leading-relaxed text-ink/60">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Para cada rol (bloque naranja, cards horizontales) ===== */}
      <section className="relative overflow-hidden bg-warm py-16 sm:py-24">
        <Loops className="right-8 top-10 h-20 w-32 text-white/40" />
        <div className="relative mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <Badge on="warm">Para cada rol</Badge>
            <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">Pensado para <Blue>toda la comunidad</Blue></h2>
          </div>
          <div className="mt-12 flex flex-col gap-5">
            {ROLES.map((r) => (
              <div key={r.title} className="grid gap-5 overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-card sm:grid-cols-[1.4fr_1fr] sm:items-center">
                <div className="order-2 sm:order-1">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-800 ${ACCENT_ON[r.color]}`}>{r.tag}</span>
                  <h3 className="mt-3 font-display text-xl font-800 text-ink">{r.title}</h3>
                  <p className="mt-2 text-sm font-500 leading-relaxed text-ink/60">{r.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {r.meta.map((m) => (
                      <span key={m} className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-xs font-700 text-ink/60">
                        <Icon name="Check" className="h-3 w-3 text-brand" />{m}
                      </span>
                    ))}
                  </div>
                  <a href="#contacto" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-800 text-white transition-colors hover:bg-navy-deep">
                    Conocer más <Icon name="ArrowRight" className="h-4 w-4" />
                  </a>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt="" className="order-1 aspect-[16/11] w-full rounded-2xl object-cover sm:order-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Planes ===== */}
      <section id="planes" className="relative overflow-hidden py-16 sm:py-24">
        <Dots className="right-10 top-12 h-16 w-16 text-cta/40" />
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <Badge>Planes</Badge>
            <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">El plan ideal <Blue>para tu colegio</Blue></h2>
            <p className="mt-3 font-500 text-ink/60">Precios de referencia. El plan final se arma según el tamaño del colegio.</p>
          </div>
          <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
            {PLANES.map((p) => (
              <div key={p.name} className={`relative rounded-[1.75rem] p-7 shadow-card ${p.featured ? "bg-gradient-to-br from-navy to-navy-deep text-white lg:-translate-y-3" : "border border-ink/5 bg-white"}`}>
                {p.featured && <span className="absolute right-6 top-7 inline-flex items-center gap-1.5 rounded-full bg-cta px-3 py-1 text-xs font-800 text-white"><Icon name="Star" className="h-3.5 w-3.5 fill-white" /> Más elegido</span>}
                <span className={`text-sm font-800 ${p.featured ? "text-white/70" : "text-ink/45"}`}>{p.name}</span>
                <div className="mt-3 flex items-end gap-1">
                  <span className={`font-display text-4xl font-800 ${p.featured ? "text-white" : "text-ink"}`}>{p.price}</span>
                  <span className={`mb-1 text-sm font-600 ${p.featured ? "text-white/60" : "text-ink/45"}`}>/ {p.period}</span>
                </div>
                <p className={`mt-3 text-sm ${p.featured ? "text-white/70" : "text-ink/55"}`}>{p.desc}</p>
                <ul className="mt-6 flex flex-col gap-3">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2.5 text-sm font-600 ${p.featured ? "text-white/85" : "text-ink/70"}`}>
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${p.featured ? "bg-cta text-white" : "bg-brand/15 text-brand"}`}><Icon name="Check" className="h-3 w-3" /></span>{f}
                    </li>
                  ))}
                </ul>
                <a href="#contacto" className={`mt-7 block rounded-full py-3.5 text-center text-sm font-800 transition-colors ${p.featured ? "bg-cta text-white hover:bg-cta-deep" : "bg-ink text-white hover:bg-navy-deep"}`}>Solicitar demo</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Cómo empezar ===== */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <Badge>Cómo empezar</Badge>
            <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">Tu colegio conectado <Blue>en 4 pasos</Blue></h2>
          </div>
          <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-8 hidden border-t-2 border-dashed border-brand/25 lg:block" />
            {PASOS.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-white text-brand shadow-card ring-1 ring-ink/5">
                  <Icon name={s.icon} className="h-7 w-7" />
                  <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-cta font-display text-xs font-800 text-white">{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-800 text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm font-500 leading-relaxed text-ink/60">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonio (bloque naranja) ===== */}
      <section className="relative overflow-hidden bg-warm py-16 sm:py-24">
        <Loops className="left-8 top-10 h-20 w-32 text-white/40" />
        <Sparkle className="right-10 bottom-12 h-9 w-9 text-ink/20" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <Badge on="warm">Testimonios</Badge>
          <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">Lo que dicen <Blue>los colegios</Blue></h2>
          <div className="relative mt-10 rounded-[2rem] bg-white p-8 shadow-pop sm:p-12">
            <Icon name="Quote" className="mx-auto h-10 w-10 text-cta/30" />
            <div className="mt-2 flex justify-center gap-1 text-cta">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="Star" className="h-5 w-5 fill-cta" />)}</div>
            <p className="mt-5 text-lg font-600 leading-relaxed text-ink/80">
              &ldquo;Desde que usamos Colequium, las familias se enteran de todo y dejamos
              atrás el caos de los grupos de WhatsApp. La comunicación del colegio
              cambió por completo.&rdquo;
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://picsum.photos/seed/cqtesti/80/80" alt="" className="h-12 w-12 rounded-full object-cover" />
              <div className="text-left">
                <p className="font-display text-sm font-800 text-ink">Mariana Saldaña</p>
                <p className="text-xs font-600 text-ink/55">Directora · Colegio Las Lomas</p>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-ink/40"><Icon name="ChevronLeft" className="h-4 w-4" /></span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white"><Icon name="ChevronRight" className="h-4 w-4" /></span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Recursos (featured + lista) ===== */}
      <section id="recursos" className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge>Recursos</Badge>
              <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">Ideas para <Blue>tu comunidad</Blue></h2>
            </div>
            <a href="#" className="rounded-full border-2 border-ink/10 bg-white px-5 py-2.5 text-sm font-800 text-ink transition-colors hover:border-brand/40 hover:text-brand">Ver todo</a>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <article className="overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-card transition-transform hover:-translate-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={RECURSOS[0].img} alt="" className="aspect-[16/9] w-full object-cover" />
              <div className="p-6">
                <span className="text-xs font-800 text-cta">{RECURSOS[0].tag}</span>
                <h3 className="mt-2 font-display text-xl font-800 leading-snug text-ink">{RECURSOS[0].title}</h3>
                <p className="mt-2 text-xs font-600 text-ink/45">{RECURSOS[0].date}</p>
              </div>
            </article>
            <div className="flex flex-col gap-5">
              {RECURSOS.slice(1).map((r) => (
                <article key={r.title} className="flex gap-4 overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white p-3 shadow-card transition-transform hover:-translate-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt="" className="h-28 w-32 shrink-0 rounded-2xl object-cover" />
                  <div className="py-2 pr-2">
                    <span className="text-xs font-800 text-cta">{r.tag}</span>
                    <h3 className="mt-1 font-display text-base font-800 leading-snug text-ink">{r.title}</h3>
                    <p className="mt-2 text-xs font-600 text-ink/45">{r.date}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <Dots className="left-10 top-16 h-16 w-16 text-brand/30" />
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Badge>Preguntas frecuentes</Badge>
            <h2 className="mt-4 font-display text-3xl font-800 leading-tight text-ink sm:text-4xl">¿Tienes <Blue>dudas?</Blue></h2>
            <p className="mt-4 font-500 text-ink/60">Resolvemos las preguntas más comunes. ¿Tienes otra? Escríbenos y te respondemos enseguida.</p>
            <Sparkle className="mt-6 h-10 w-10 text-cta" />
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-ink/10 bg-white p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-base font-800 text-ink">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition-transform group-open:rotate-180"><Icon name="ChevronDown" className="h-4 w-4" /></span>
                </summary>
                <p className="mt-3 text-sm font-500 leading-relaxed text-ink/65">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA + Contacto (bloque naranja) ===== */}
      <section id="contacto" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-warm p-8 text-center shadow-pop sm:p-14">
          <Loops className="left-6 top-8 h-20 w-32 text-white/50" />
          <Dots className="right-8 bottom-8 h-20 w-20 text-ink/15" />
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            {["cqf1", "cqf2", "cqf3", "cqf4"].map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s} src={`https://picsum.photos/seed/${s}/72/72`} alt="" className={`absolute h-14 w-14 rounded-2xl border-2 border-white object-cover shadow-sm ${["left-10 top-12", "left-20 bottom-14", "right-12 top-14", "right-24 bottom-12"][i]}`} />
            ))}
          </div>
          <div className="relative mx-auto max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-800 text-cta"><span className="h-2 w-2 rounded-full bg-cta" /> Comunicación escolar</span>
            <h2 className="mt-5 font-display text-3xl font-800 text-ink sm:text-4xl">¿Listo para conectar tu colegio?</h2>
            <p className="mx-auto mt-3 max-w-md font-500 text-ink/70">Déjanos tus datos y coordinamos una demo. El acceso de familias y docentes es por invitación del colegio.</p>
            <form className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
              <input type="email" required placeholder="Correo del colegio" className="min-w-0 flex-1 rounded-full bg-white px-5 py-3.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-ink/20" />
              <button type="submit" className="rounded-full bg-ink px-6 py-3.5 text-sm font-800 text-white shadow-card transition-colors hover:bg-navy-deep">Solicitar demo</button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-ink/5 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm font-500 text-ink/55">La comunidad escolar, conectada en un solo lugar. Para LatAm y Brasil.</p>
          </div>
          {[
            { h: "Producto", items: ["Funciones", "Planes", "Novedades", "Seguridad"] },
            { h: "Empresa", items: ["Sobre Colequium", "Recursos", "Contacto", "Trabaja con nosotros"] },
            { h: "Legal", items: ["Privacidad", "Términos", "Datos de menores"] },
          ].map((col) => (
            <div key={col.h}>
              <h3 className="font-display text-sm font-800 text-ink">{col.h}</h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm font-500 text-ink/55">
                {col.items.map((it) => <li key={it}><a href="#" className="transition-colors hover:text-brand">{it}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-ink/5">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm font-500 text-ink/45 sm:flex-row">
            <p>© 2026 Colequium · Comunicación escolar</p>
            <span className="flex items-center gap-2"><Icon name="Mail" className="h-4 w-4" /> hola@colequium.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
