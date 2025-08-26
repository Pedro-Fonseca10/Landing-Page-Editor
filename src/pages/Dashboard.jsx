export default function Dashboard() {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="border rounded-xl p-4">Clientes</div>
        <div className="border rounded-xl p-4">Landing Pages</div>
        <div className="border rounded-xl p-4">Métricas</div>
      </div>
    </div>
  );
}
