import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EmBrevePage() {
  return (
    <main className="min-h-screen bg-surface font-body text-on-surface">
      {/* ── Hero Section ── */}
      <section className="relative flex min-h-[870px] items-center overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-banner.jpg"
            alt="Universidade"
            className="h-full w-full object-cover opacity-20 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001337] to-primary-container opacity-90" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-8 md:grid-cols-12">
          {/* Content area (8 columns) */}
          <div className="flex flex-col space-y-10 py-20 md:col-span-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-tertiary-fixed-dim px-4 py-1 text-xs font-bold uppercase tracking-widest text-on-tertiary-fixed">
                Lançamento em breve
              </span>
              <h1 className="max-w-2xl font-headline text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl">
                Excelência Acadêmica em Construção.
              </h1>
            </div>

            <p className="max-w-xl text-lg leading-relaxed text-white/90 md:text-xl">
              Estamos lapidando o futuro da educação superior. Um ecossistema
              desenhado com rigor acadêmico para conectar pesquisadores,
              estudantes e instituições ao redor do globo.
            </p>

            {/* Progress indicator */}
            <div className="max-w-md space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold uppercase tracking-wider text-white">
                  Status do Desenvolvimento
                </span>
                <span className="font-headline text-2xl font-bold text-tertiary-fixed-dim">
                  84%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div className="relative h-full w-[84%] rounded-full bg-tertiary-fixed-dim">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                </div>
              </div>
              <p className="text-xs italic text-white/60">
                Fase atual: Refinamento de metadados e algoritmos de
                recomendação.
              </p>
            </div>

            <div className="flex flex-col gap-6 pt-4 sm:flex-row">
              <Link
                href="/universities"
                className="flex items-center justify-center gap-3 rounded-lg bg-tertiary-fixed-dim px-8 py-4 text-base font-bold text-primary shadow-2xl transition-all hover:brightness-110"
              >
                <span>Explorar Universidades</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-white/20 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/5"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>

          {/* Right decorative image */}
          <div className="hidden items-center justify-center md:col-span-4 md:flex">
            <div className="relative aspect-[4/5] w-full rotate-3 overflow-hidden rounded-xl shadow-2xl">
              <img
                src="/em-breve-card.jpg"
                alt="Universidade em construção"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/20" />
              <div className="glass-effect absolute bottom-0 left-0 right-0 border-t border-white/10 bg-white/10 p-8 text-white">
                <p className="font-headline text-sm italic">
                  &ldquo;A educação não é preparação para a vida; a educação é a
                  própria vida.&rdquo;
                </p>
                <p className="mt-2 text-xs opacity-70">— John Dewey</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Teaser Grid ── */}
      <section className="bg-surface-container-low py-24">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div className="max-w-xl space-y-4">
              <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">
                O que está por vir?
              </h2>
              <p className="text-lg text-on-surface-variant">
                Estamos unindo curadoria editorial com tecnologia de ponta para
                transformar a pesquisa institucional.
              </p>
            </div>
            <div className="mx-8 hidden h-px flex-grow bg-outline-variant/20 md:block" />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature Card 1 */}
            <div className="group space-y-6 rounded-xl bg-surface-container-lowest p-10 transition-shadow hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-container">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="font-headline text-xl font-bold text-primary">
                Análise Preditiva
              </h3>
              <p className="leading-relaxed text-on-surface-variant">
                Algoritmos proprietários que identificam tendências de pesquisa
                antes mesmo de se tornarem mainstream.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group space-y-6 rounded-xl bg-surface-container-lowest p-10 transition-shadow hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-container">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3 className="font-headline text-xl font-bold text-primary">
                Perfis Institucionais
              </h3>
              <p className="leading-relaxed text-on-surface-variant">
                Uma visão 360° das universidades mais renomadas, focada em
                métricas de impacto e cultura acadêmica.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group space-y-6 rounded-xl bg-surface-container-lowest p-10 transition-shadow hover:shadow-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-container">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272z" />
                </svg>
              </div>
              <h3 className="font-headline text-xl font-bold text-primary">
                Curadoria Humana
              </h3>
              <p className="leading-relaxed text-on-surface-variant">
                Nossa equipe de especialistas revisa e contextualiza os dados
                para garantir veracidade e profundidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter / CTA ── */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="relative z-10 mx-auto max-w-7xl px-8">
          <div className="flex flex-col items-center justify-between gap-12 rounded-xl bg-primary p-12 md:flex-row md:p-20">
            <div className="max-w-lg space-y-6">
              <h2 className="font-headline text-3xl font-bold leading-tight text-white md:text-4xl">
                Seja o primeiro a saber quando abrirmos as portas.
              </h2>
              <p className="text-lg text-white/80">
                Cadastre-se para receber um convite exclusivo de acesso
                antecipado e insights mensais.
              </p>
            </div>
            <div className="w-full max-w-md">
              <form className="flex flex-col space-y-4">
                <input
                  type="email"
                  placeholder="Seu e-mail institucional"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-6 py-4 text-white outline-none transition-all placeholder:text-white/40 focus:ring-2 focus:ring-tertiary-fixed-dim"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-white px-8 py-4 font-bold text-primary transition-colors hover:bg-primary-fixed"
                >
                  Solicitar Acesso Prioritário
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-secondary/10" />
      </section>
    </main>
  );
}
