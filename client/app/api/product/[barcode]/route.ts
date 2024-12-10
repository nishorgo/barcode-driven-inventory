import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: Request,
  { params }: { params: { barcode: string } }
) {
  const barcode = params.barcode;

  try {
    const response = await axios.get(`https://products-test-aci.onrender.com/product/${barcode}`, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Error fetching product data', error: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
