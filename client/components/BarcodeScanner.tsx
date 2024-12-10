"use client"

import { createProduct, scanAndFetchProduct } from '@/services/productService';
import { Product } from '@/types/product';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';

const BarcodeScanner = () => {
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
                scanner.clear();
                setScannedCode(decodedText);
                setFetchedProduct(scannedProduct.description);

                const newProduct: Product = {
                    barcode: decodedText,
                    name: scannedProduct.description,
                    description: scannedProduct.description,
                    stock: 134, // Default quantity
                    price: 70, // Default price, update as needed
                };

                const created = await createProduct(newProduct);
                console.log('Product created:', created);
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
    }, []);

    return (
        <div className="flex flex-col gap-4 bg-white m-4 p-4 rounded-lg shadow-md">
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