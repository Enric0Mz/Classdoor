import Link from "next/link";

export const metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 pt-16 text-center">
      <p className="mb-4 text-7xl font-bold text-primary">404</p>
      <h1 className="font-headline mb-2 text-2xl font-bold text-on-surface">
        Página não encontrada
      </h1>
      <p className="mb-8 max-w-md text-on-surface-variant">
        A página que você procura não existe ou foi movida. Verifique o endereço
        ou volte para a página inicial.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-primary px-8 py-3 font-bold text-white transition-all hover:brightness-110"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
