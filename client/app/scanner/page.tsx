"use client"

import BarcodeScanner from '@/components/BarcodeScanner'
import KanbanBoard from '@/components/KanbanBoard'
import { useRef } from 'react'
import { Product } from '@/types/product'

export default function Home() {
  // Create a reference to the KanbanBoard component to call its method
  const kanbanBoardRef = useRef<{ addProductToUncategorized: (product: Product) => void }>(null);

  // Handler to add scanned product to uncategorized column
  const handleProductScanned = (product: Product) => {
    // Use the ref to call the method on KanbanBoard
    if (kanbanBoardRef.current) {
      kanbanBoardRef.current.addProductToUncategorized(product);
    }
  };

  return (
    <main className="flex min-h-screen justify-between p-24">
      <div className="z-10 w-full font-mono text-sm">
      <h1 className="text-4xl font-bold ps-4">Inventory Scanner</h1>
      <div className='flex gap-4'>
        <div className='w-2/3'>
          <KanbanBoard ref={kanbanBoardRef} />
        </div>
        <div className='w-1/3'>
          <BarcodeScanner onProductScanned={handleProductScanned} />
        </div>
      </div>

      </div>
    </main>
  )
}