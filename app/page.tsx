import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Icon } from "@/components/icons";
import { ACCENT_ON, type AccentColor } from "@/components/colors";

/* Resaltado tipo "marcador" naranja (como el amarillo del template). */
function Mark({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-xl bg-cta/20 px-2 text-ink">{children}</span>
  );
}
/* Palabra acentuada en azul. */
function Blue({ children }: { children: React.ReactNode }) {
  return <span className="text-brand">{children}</span>;
}

const FUNCIONES: { icon: string; color: AccentColor; title: string; text: string }[] = [
  { icon: "Megaphone", color: "news", title: "Novedades", text: "Avisos del colegio con foto, likes y comentarios, segmentados por curso." },
  { icon: "CalendarDays", color: "brand", title: "Calendario", text: "Exámenes, eventos y vacaciones en un calendario claro y compartido." },
  { icon: "MessagesSquare", color: "sky", title: "Mensajes", text: "Conversaciones entre familias y docentes, siempre dentro de cada salón." },
  { icon: "ClipboardList", color: "requests", title: "Trámites", text: "Inasistencias, autorizaciones y comprobantes, sin papeles." },
  { icon: "FolderClosed", color: "docs", title: "Documentos", text: "Boletines, circulares y protocolos ordenados y a un clic." },
  { icon: "Bus", color: "transport", title: "Transporte", text: "Seguimiento del camión escolar en vivo y avisos de subida y bajada." },
];

const VALORES: { icon: string; title: string; text: string }[] = [
  { icon: "ShieldCheck", title: "Privacidad", text: "Cada familia ve solo lo de sus hijos. Datos protegidos por diseño." },
  { icon: "Smile", title: "Cercanía", text: "Una herramienta simple que cualquiera usa desde el primer día." },
  { icon: "Zap", title: "Claridad", text: "La información importante llega y se lee. Sin grupos de chat caóticos." },
  { icon: "Languages", title: "Multi-idioma", text: "Español, portugués y términos de cada país, listos para escalar." },
];

const ROLES: { tag: string; color: AccentColor; title: string; text: string; img: string }[] = [
  { tag: "Dirección", color: "brand", title: "Para el equipo directivo", text: "Comunica a toda la comunidad, mide qué se lee y mantén todo ordenado.", img: "https://picsum.photos/seed/cqrole1/520/360" },
  { tag: "Docentes", color: "sky", title: "Para los docentes", text: "Habla con las familias de tu salón, comparte tareas y eventos en segundos.", img: "https://picsum.photos/seed/cqrole2/520/360" },
  { tag: "Familias", color: "news", title: "Para las familias", text: "Enterate de todo, resuelve trámites y sigue el día a día de tus hijos.", img: "https://picsum.photos/seed/cqrole3/520/360" },
];

const PLANES: {
  name: string; price: string; period: string; desc: string; features: string[]; featured?: boolean;
}[] = [
  { name: "Demo", price: "$0", period: "para probar", desc: "Para conocer Colequium con un grupo piloto del colegio.", features: ["Hasta 1 salón", "Novedades y calendario", "Soporte por correo"] },
  { name: "Escuela", price: "$XX", period: "por mes", desc: "Para colegios que quieren todo conectado.", features: ["Salones ilimitados", "Mensajes y trámites", "Multi-idioma", "Soporte prioritario"], featured: true },
  { name: "Institución", price: "A medida", period: "varios colegios", desc: "Para redes y grupos educativos.", features: ["Todo lo de Escuela", "Transporte en vivo", "Integraciones", "Gestor de cuenta dedicado"] },
];

const PASOS: { icon: string; title: string; text: string }[] = [
  { icon: "Phone", title: "Agenda una demo", text: "Te mostramos Colequium con datos de tu colegio." },
  { icon: "Settings", title: "Configuramos todo", text: "Cargamos niveles, salones y roles por vos." },
  { icon: "Users", title: "Invita a la comunidad", text: "Familias y docentes entran por invitación." },
  { icon: "Sparkles", title: "Empiezan a comunicarse", text: "Todo el colegio, conectado desde el día uno." },
];

const RECURSOS: { tag: string; title: string; date: string; img: string }[] = [
  { tag: "Comunidad", title: "5 ideas para que las familias lean tus avisos", date: "10 jun 2026", img: "https://picsum.photos/seed/cqblog1/440/300" },
  { tag: "Gestión", title: "Cómo organizar el calendario escolar del trimestre", date: "03 jun 2026", img: "https://picsum.photos/seed/cqblog2/440/300" },
  { tag: "Tecnología", title: "Adiós a los grupos de WhatsApp del colegio", date: "28 may 2026", img: "https://picsum.photos/seed/cqblog3/440/300" },
];

const FAQS: { q: string; a: string }[] = [
  { q: "¿Cómo entran las familias y los docentes?", a: "Por invitación del colegio. El equipo directivo carga o invita a cada persona, así nadie ajeno accede a la comunidad." },
  { q: "¿Las familias ven información de otros salones?", a: "No. Cada familia ve únicamente lo de los salones de sus hijos. La privacidad está garantizada a nivel de la base de datos." },
  { q: "¿Sirve para colegios de otros países?", a: "Sí. Colequium está pensado para LatAm y Brasil: idioma y términos regionales se adaptan a cada país." },
  { q: "¿Necesitamos instalar algo?", a: "No. Funciona desde el navegador y, más adelante, con apps para Android e iOS. La configuración la hacemos nosotros." },
];

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
            <Link href="/login" className="hidden rounded-2xl px-4 py-2.5 text-sm font-800 text-ink transition-colors hover:bg-white sm:block">
              Ingresar
            </Link>
            <a href="#contacto" className="rounded-2xl bg-cta px-5 py-2.5 text-sm font-800 text-white shadow-soft transition-colors hover:bg-cta-deep">
              Solicitar demo
            </a>
          </div>
        </nav>
      </header>

      {/* ===== Hero ===== */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-8 lg:grid-cols-2 lg:pb-20 lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-sm font-700 text-ink/70 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-cta" />
            Plataforma de comunicación escolar
          </span>
          <h1 className="mt-6 font-display text-4xl font-800 leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
            <Mark>Conecta</Mark> a tu colegio con las familias <Blue>como nunca</Blue>
          </h1>
          <p className="mt-5 max-w-lg text-lg font-500 leading-relaxed text-ink/65">
            Novedades, calendario, mensajes y trámites entre el colegio, las
            familias y los docentes. Claro, ordenado y en el idioma de cada país.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#contacto" className="flex items-center justify-center gap-2 rounded-2xl bg-cta px-7 py-4 text-base font-800 text-white shadow-soft transition-colors hover:bg-cta-deep">
              Empieza hoy <Icon name="ArrowRight" className="h-5 w-5" />
            </a>
            <a href="#funciones" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-ink/10 bg-white px-7 py-4 text-base font-800 text-ink transition-colors hover:border-brand/40 hover:text-brand">
              Ver funciones
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-2 gap-6">
            <div>
              <dt className="font-display text-3xl font-800 text-ink">+120</dt>
              <dd className="text-sm font-600 text-ink/55">Colegios conectados</dd>
            </div>
            <div>
              <dt className="font-display text-3xl font-800 text-ink">98%</dt>
              <dd className="text-sm font-600 text-ink/55">Avisos leídos</dd>
            </div>
          </dl>
        </div>

        {/* Visual con tarjetas flotantes */}
        <div className="relative">
          <div className="overflow-hidden rounded-[2.5rem] border border-ink/5 bg-white shadow-pop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://picsum.photos/seed/cqhero2/720/680" alt="Comunidad escolar" className="aspect-[5/6] w-full object-cover" />
          </div>
          <div className="absolute left-4 top-6 flex items-center gap-3 rounded-3xl border border-ink/5 bg-white p-3 shadow-card">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white font-display text-sm font-800">98%</span>
            <span className="text-xs font-700 leading-tight text-ink">Avisos<br />leídos</span>
          </div>
          <div className="absolute -bottom-4 right-4 flex items-center gap-3 rounded-3xl border border-ink/5 bg-white p-3 shadow-card">
            <span className="flex -space-x-2">
              {["cqa1", "cqa2", "cqa3"].map((s) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={s} src={`https://picsum.photos/seed/${s}/40/40`} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
              ))}
            </span>
            <span className="text-xs font-700 leading-tight text-ink">+30,000<br />familias</span>
          </div>
        </div>
      </section>

      {/* ===== Logos / confianza ===== */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <p className="text-center text-sm font-700 text-ink/40">
          Colegios de toda Latinoamérica confían en Colequium
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-50">
          {["Colegio Las Lomas", "Instituto del Sol", "Colegio San Marcos", "Liceo Norte", "Escuela Río"].map((n) => (
            <span key={n} className="font-display text-lg font-800 text-ink/50">{n}</span>
          ))}
        </div>
      </section>

      {/* ===== Funciones ===== */}
      <section id="funciones" className="bg-[#fff5ea] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-800 text-cta">Funciones</span>
            <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">
              Todo lo del colegio, <Blue>en un solo lugar</Blue>
            </h2>
            <p className="mt-3 text-ink/60">Seis módulos que reemplazan los grupos de chat, los papeles y los mails perdidos.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FUNCIONES.map((f) => (
              <div key={f.title} className="group rounded-[1.75rem] border border-ink/5 bg-white p-6 shadow-card transition-transform hover:-translate-y-1">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${ACCENT_ON[f.color]}`}>
                  <Icon name={f.icon} className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-display text-xl font-800 text-ink">{f.title}</h3>
                <p className="mt-2 text-sm font-500 leading-relaxed text-ink/60">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Sobre Colequium ===== */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://picsum.photos/seed/cqabout/640/520" alt="" className="aspect-[6/5] w-full rounded-[2.5rem] object-cover shadow-card" />
            <div className="absolute -bottom-5 -right-3 rounded-3xl border border-ink/5 bg-white p-4 shadow-pop">
              <p className="font-display text-2xl font-800 text-ink">+5 años</p>
              <p className="text-xs font-600 text-ink/55">acompañando colegios</p>
            </div>
          </div>
          <div>
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-800 text-brand">Sobre Colequium</span>
            <h2 className="mt-4 font-display text-3xl font-800 leading-tight text-ink sm:text-4xl">
              Comunicación <Blue>clara</Blue> para toda la comunidad
            </h2>
            <p className="mt-4 text-ink/65">
              Reconstruimos, con tecnología y diseño modernos, la forma en que el
              colegio habla con las familias. Menos ruido, más claridad, y la
              información importante siempre a mano.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {["Una sola app para avisos, calendario, mensajes y trámites", "Pensado para directivos, docentes y familias", "Listo para crecer a varios países e idiomas"].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm font-600 text-ink/75">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-white"><Icon name="Check" className="h-3 w-3" /></span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Valores ===== */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-800 text-brand">Nuestros valores</span>
            <h2 className="mt-4 font-display text-3xl font-800 leading-tight text-ink sm:text-4xl">
              En qué <Blue>creemos</Blue>
            </h2>
            <p className="mt-4 max-w-md text-ink/65">
              Cada decisión de producto pasa por estos cuatro principios.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {VALORES.map((v) => (
              <div key={v.title}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cta/15 text-cta">
                  <Icon name={v.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-800 text-ink">{v.title}</h3>
                <p className="mt-1.5 text-sm font-500 leading-relaxed text-ink/60">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Para cada rol ===== */}
      <section className="bg-[#fff5ea] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-xl text-center">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-800 text-cta">Para cada rol</span>
            <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">
              Pensado para <Blue>toda la comunidad</Blue>
            </h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {ROLES.map((r) => (
              <div key={r.title} className="overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt="" className="aspect-[16/10] w-full object-cover" />
                <div className="p-6">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-800 ${ACCENT_ON[r.color]}`}>{r.tag}</span>
                  <h3 className="mt-3 font-display text-xl font-800 text-ink">{r.title}</h3>
                  <p className="mt-2 text-sm font-500 leading-relaxed text-ink/60">{r.text}</p>
                  <a href="#contacto" className="mt-4 inline-flex items-center gap-1.5 text-sm font-800 text-brand transition-colors hover:text-ink">
                    Conocer más <Icon name="ArrowRight" className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Planes / Pricing ===== */}
      <section id="planes" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-800 text-brand">Planes</span>
          <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">
            El plan ideal <Blue>para tu colegio</Blue>
          </h2>
          <p className="mt-3 text-ink/60">Precios de referencia. El plan final se arma según el tamaño del colegio.</p>
        </div>
        <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
          {PLANES.map((p) => (
            <div key={p.name} className={`rounded-[1.75rem] border p-7 shadow-card ${p.featured ? "border-transparent bg-gradient-to-br from-navy to-navy-deep text-white" : "border-ink/5 bg-white"}`}>
              {p.featured ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cta px-3 py-1 text-xs font-800 text-white">
                  <Icon name="Star" className="h-3.5 w-3.5" /> Más elegido
                </span>
              ) : (
                <span className="text-sm font-800 text-ink/50">{p.name}</span>
              )}
              <h3 className={`mt-3 font-display text-xl font-800 ${p.featured ? "text-white" : "text-ink"}`}>{p.featured ? p.name : ""}</h3>
              <p className={`mt-2 text-sm ${p.featured ? "text-white/70" : "text-ink/55"}`}>{p.desc}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className={`font-display text-4xl font-800 ${p.featured ? "text-white" : "text-ink"}`}>{p.price}</span>
                <span className={`mb-1 text-sm font-600 ${p.featured ? "text-white/60" : "text-ink/45"}`}>/ {p.period}</span>
              </div>
              <ul className="mt-6 flex flex-col gap-3">
                {p.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2.5 text-sm font-600 ${p.featured ? "text-white/85" : "text-ink/70"}`}>
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${p.featured ? "bg-cta text-white" : "bg-brand/15 text-brand"}`}>
                      <Icon name="Check" className="h-3 w-3" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#contacto" className={`mt-7 block rounded-2xl py-3.5 text-center text-sm font-800 transition-colors ${p.featured ? "bg-cta text-white hover:bg-cta-deep" : "bg-ink text-white hover:bg-navy-deep"}`}>
                Solicitar demo
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Cómo empezar / Journey ===== */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-800 text-brand">Cómo empezar</span>
          <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">
            Tu colegio conectado <Blue>en 4 pasos</Blue>
          </h2>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-brand/10 text-brand">
                <Icon name={s.icon} className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-cta font-display text-xs font-800 text-white">{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-lg font-800 text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm font-500 leading-relaxed text-ink/60">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Testimonio ===== */}
      <section className="bg-[#fff5ea] py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <span className="rounded-full bg-white px-4 py-1.5 text-sm font-800 text-cta">Testimonios</span>
          <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">
            Lo que dicen <Blue>los colegios</Blue>
          </h2>
          <div className="relative mt-10 rounded-[2rem] bg-white p-8 shadow-pop sm:p-12">
            <Icon name="Quote" className="mx-auto h-10 w-10 text-cta/30" />
            <div className="mt-2 flex justify-center gap-1 text-cta">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="Star" className="h-5 w-5 fill-cta" />
              ))}
            </div>
            <p className="mt-5 text-lg font-600 leading-relaxed text-ink/80">
              "Desde que usamos Colequium, las familias se enteran de todo y dejamos
              atrás el caos de los grupos de WhatsApp. La comunicación del colegio
              cambió por completo."
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://picsum.photos/seed/cqtesti/80/80" alt="" className="h-12 w-12 rounded-full object-cover" />
              <div className="text-left">
                <p className="font-display text-sm font-800 text-ink">Mariana Saldaña</p>
                <p className="text-xs font-600 text-ink/55">Directora · Colegio Las Lomas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Recursos / Blog ===== */}
      <section id="recursos" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-800 text-brand">Recursos</span>
            <h2 className="mt-4 font-display text-3xl font-800 text-ink sm:text-4xl">
              Ideas para <Blue>tu comunidad</Blue>
            </h2>
          </div>
          <a href="#" className="rounded-2xl border-2 border-ink/10 bg-white px-5 py-2.5 text-sm font-800 text-ink transition-colors hover:border-brand/40 hover:text-brand">
            Ver todo
          </a>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {RECURSOS.map((r) => (
            <article key={r.title} className="overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-card transition-transform hover:-translate-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.img} alt="" className="aspect-[16/10] w-full object-cover" />
              <div className="p-5">
                <span className="text-xs font-800 text-cta">{r.tag}</span>
                <h3 className="mt-2 font-display text-base font-800 leading-snug text-ink">{r.title}</h3>
                <p className="mt-2 text-xs font-600 text-ink/45">{r.date}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="rounded-full bg-brand/10 px-4 py-1.5 text-sm font-800 text-brand">Preguntas frecuentes</span>
            <h2 className="mt-4 font-display text-3xl font-800 leading-tight text-ink sm:text-4xl">
              ¿Tienes <Blue>dudas?</Blue>
            </h2>
            <p className="mt-4 text-ink/60">
              Resolvemos las preguntas más comunes. ¿Tienes otra? Escríbenos y te
              respondemos enseguida.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-ink/10 bg-white p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-base font-800 text-ink">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand transition-transform group-open:rotate-180">
                    <Icon name="ChevronDown" className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 text-sm font-500 leading-relaxed text-ink/65">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA + Contacto ===== */}
      <section id="contacto" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-navy to-navy-deep p-8 text-white shadow-pop sm:p-14">
          <div className="absolute inset-0 opacity-10 [background:repeating-linear-gradient(45deg,rgba(255,255,255,.6)_0_14px,transparent_14px_30px)]" />
          {/* avatares flotantes */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            {["cqf1", "cqf2", "cqf3", "cqf4"].map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s} src={`https://picsum.photos/seed/${s}/72/72`} alt="" className={`absolute h-14 w-14 rounded-2xl border-2 border-white/30 object-cover ${["left-8 top-10", "left-16 bottom-12", "right-10 top-12", "right-20 bottom-10"][i]}`} />
            ))}
          </div>
          <div className="relative mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-700">
              <span className="h-2 w-2 rounded-full bg-cta" /> Comunicación escolar
            </span>
            <h2 className="mt-5 font-display text-3xl font-800 sm:text-4xl">
              ¿Listo para conectar tu colegio?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/70">
              Déjanos tus datos y coordinamos una demo. El acceso de familias y
              docentes es por invitación del colegio.
            </p>
            <form className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
              <input type="email" required placeholder="Correo del colegio" className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-3.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-cta/40" />
              <button type="submit" className="rounded-2xl bg-cta px-6 py-3.5 text-sm font-800 text-white shadow-soft transition-colors hover:bg-cta-deep">
                Solicitar demo
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Wordmark theme="dark" />
            <p className="mt-4 max-w-xs text-sm text-white/55">
              La comunidad escolar, conectada en un solo lugar. Para LatAm y Brasil.
            </p>
          </div>
          {[
            { h: "Producto", items: ["Funciones", "Planes", "Novedades", "Seguridad"] },
            { h: "Empresa", items: ["Sobre Colequium", "Recursos", "Contacto", "Trabajá con nosotros"] },
            { h: "Legal", items: ["Privacidad", "Términos", "Datos de menores"] },
          ].map((col) => (
            <div key={col.h}>
              <h3 className="font-display text-sm font-800 text-white">{col.h}</h3>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm font-500 text-white/55">
                {col.items.map((it) => (
                  <li key={it}><a href="#" className="transition-colors hover:text-white">{it}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-white/45 sm:flex-row">
            <p>© 2026 Colequium · Comunicación escolar</p>
            <div className="flex items-center gap-2">
              <Icon name="Mail" className="h-4 w-4" /> hola@colequium.com
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
