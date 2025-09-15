/*
  Componente de rodapé da aplicação. Exibe informações de direitos autorais.
  */

export default function AppFooter() {
  const note = "© " + new Date().getFullYear() + " Landing Page Editor. Todos os direitos reservados a Pedro Henrique Diógenes da Fonseca 59.181.375/0001-48."
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center text-sm text-slate-600 dark:text-slate-400">
          {note}
        </div>
      </div>
    </footer>
  )
}

