import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background px-6 py-3">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-semibold text-primary">
          classdoor
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/universities"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Explorar
          </Link>
          <Link
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Rankings
          </Link>
          <Link
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Cursos
          </Link>
          <Link
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Salários
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Busca aí..."
            className="h-9 w-56 rounded-lg bg-input-background px-3 pr-8 text-sm outline-none placeholder:text-muted-foreground"
          />
          <svg
            className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
        <Link
          href="#"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Avaliar
        </Link>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
          U
        </div>
      </div>
    </nav>
  );
}
