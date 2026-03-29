export default function ResultsPage({ params }: { params: { ticker: string } }) {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D1B3E' }}>
      <div className="text-white text-center">
        <p className="text-gray-400 text-lg mb-2">Liquidity report for</p>
        <h1 className="text-5xl font-bold uppercase">{params.ticker}</h1>
        <p className="text-gray-500 mt-4">Charts and analysis coming in Phase 2.</p>
      </div>
    </main>
  )
}
