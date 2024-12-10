"use client"

import { scanAndFetchProduct } from '@/services/productService';
import { Product } from '@/types/product';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';

interface BarcodeScannerProps {
  onProductScanned: (product: Product) => void;
}

const BarcodeScanner = ({ onProductScanned }: BarcodeScannerProps) => {
    const [scannedCode, setScannedCode] = useState<string>('');
    const [fetchedProduct, setFetchedProduct] = useState<string>('');

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 150 },
            },
            false
        );

        async function onScanSuccess(decodedText: string, decodedResult: any) {
            try {
                const scannedProduct = await scanAndFetchProduct(decodedText);
                setScannedCode(decodedText);
                setFetchedProduct(scannedProduct.description);

                const newProduct: Product = {
                    barcode: decodedText,
                    name: scannedProduct.description,
                    description: scannedProduct.description,
                };

                // Call the prop function to add product to Kanban board
                onProductScanned(newProduct);
            } catch (error) {
                console.error('Error processing product:', error);
            }
        }
          
        function onScanFailure(error: string) {
            // Ignore frequent scan failures
            if (!error.includes('NotFoundException')) {
                console.warn(`Scan error = ${error}`);
            }
        }

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear();
        };
    }, [onProductScanned]);

    return (
        <div className="flex flex-col gap-4 bg-gray-100 text-gray-600 m-4 p-4 rounded-lg shadow-md">
            <div id="reader" className="w-full"></div>
            {scannedCode && (
                <div className="p-4 bg-gray-100 rounded-lg">
                    <p>Last scanned code: <strong>{scannedCode}</strong></p>
                    {fetchedProduct && (
                        <p className="mt-2">Product: <strong>{fetchedProduct}</strong></p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BarcodeScanner;