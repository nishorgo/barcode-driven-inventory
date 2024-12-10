import BarcodeScanner from '@/components/BarcodeScanner'
import KanbanBoard from '@/components/KanbanBoard'


export default function Home() {
  return (
    <main className="flex min-h-screen justify-between p-24">
      <div className="z-10 w-full font-mono text-sm">
      <h1 className="text-4xl font-bold ps-4">Inventory Scanner</h1>
      <div className='flex gap-4'>
        <div className='w-2/3'>
          <KanbanBoard />
        </div>
        <div className='w-1/3'>
          <BarcodeScanner />
        </div>
      </div>

      </div>
    </main>
  )
}
