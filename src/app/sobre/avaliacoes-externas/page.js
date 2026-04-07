"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ExternalReviewsInfoPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background pt-16">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant transition-colors hover:text-secondary"
        >
          <ArrowLeft size={14} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
          <h1 className="font-headline text-2xl font-bold text-primary">
            Sobre Avaliações Externas
          </h1>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-on-surface-variant">
            <p>
              Além das avaliações feitas diretamente no Classdoor, exibimos
              também dados de avaliações do <strong>Google Maps</strong> para
              oferecer uma visão mais completa sobre cada universidade.
            </p>

            <h2 className="font-headline text-base font-bold text-primary">
              De onde vêm essas avaliações?
            </h2>
            <p>
              As avaliações externas são coletadas de páginas públicas do Google
              Maps referentes a cada universidade. Elas representam a opinião de
              pessoas que avaliaram a instituição nessa plataforma.
            </p>

            <h2 className="font-headline text-base font-bold text-primary">
              Por que apenas trechos são exibidos?
            </h2>
            <p>
              Em conformidade com a <strong>LGPD</strong> (Lei Geral de Proteção
              de Dados), não armazenamos o texto completo nem informações
              pessoais dos autores das avaliações externas. Exibimos apenas um
              breve trecho do comentário e um link para a avaliação original no
              Google Maps, onde o texto completo pode ser lido.
            </p>

            <h2 className="font-headline text-base font-bold text-primary">
              Como as notas são calculadas?
            </h2>
            <p>
              A nota geral exibida na página da universidade combina as
              avaliações do Classdoor com as do Google Maps, ponderadas pelo
              número de avaliações de cada fonte. As estatísticas do Google Maps
              também são exibidas separadamente para transparência.
            </p>

            <h2 className="font-headline text-base font-bold text-primary">
              Posso ler a avaliação completa?
            </h2>
            <p>
              Sim! Cada avaliação externa possui um link{" "}
              <strong>&quot;Ler no Google Maps&quot;</strong> que abre a página
              original da avaliação em uma nova aba.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
