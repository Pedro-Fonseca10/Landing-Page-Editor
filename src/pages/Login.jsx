export default function Login() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6">
        <h1 className="text-xl mb-4">Entrar</h1>
        <form className="grid gap-3">
          <input className="border p-2 rounded" placeholder="email@ita.br" />
          <input className="border p-2 rounded" placeholder="senha" type="password" />
          <button className="border p-2 rounded">Entrar</button>
        </form>
      </div>
    </div>
  );
}
