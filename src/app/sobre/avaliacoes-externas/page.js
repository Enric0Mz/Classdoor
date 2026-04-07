"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ExternalReviewsInfoPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-indigo-500"
        >
          <ArrowLeft size={14} />
          Voltar
        </Link>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Sobre Avaliações Externas
          </h1>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
            <p>
              Além das avaliações feitas diretamente no Classdoor, exibimos
              também dados de avaliações do <strong>Google Maps</strong> para
              oferecer uma visão mais completa sobre cada universidade.
            </p>

            <h2 className="text-base font-semibold text-gray-800">
              De onde vêm essas avaliações?
            </h2>
            <p>
              As avaliações externas são coletadas de páginas públicas do Google
              Maps referentes a cada universidade. Elas representam a opinião de
              pessoas que avaliaram a instituição nessa plataforma.
            </p>

            <h2 className="text-base font-semibold text-gray-800">
              Por que apenas trechos são exibidos?
            </h2>
            <p>
              Em conformidade com a <strong>LGPD</strong> (Lei Geral de Proteção
              de Dados), não armazenamos o texto completo nem informações
              pessoais dos autores das avaliações externas. Exibimos apenas um
              breve trecho do comentário e um link para a avaliação original no
              Google Maps, onde o texto completo pode ser lido.
            </p>

            <h2 className="text-base font-semibold text-gray-800">
              Como as notas são calculadas?
            </h2>
            <p>
              A nota geral exibida na página da universidade combina as
              avaliações do Classdoor com as do Google Maps, ponderadas pelo
              número de avaliações de cada fonte. As estatísticas do Google Maps
              também são exibidas separadamente para transparência.
            </p>

            <h2 className="text-base font-semibold text-gray-800">
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
