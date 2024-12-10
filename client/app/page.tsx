'use client';

import { useEffect, useState } from 'react';
import { getAllProducts } from '@/services/productService';
import { Product } from '@/types/product';
import Link from 'next/link';
import { BarChart3, Package, ArrowUpRight, Boxes, Search } from 'lucide-react';
import AuthWrapper from '@/components/AuthWrapper';

export default function Home() {
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    categoryCounts: {} as Record<string, number>,
    recentProducts: [] as Product[],
    uncategorizedCount: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);


  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await getAllProducts();
        const products = Array.isArray(response.products) ? response.products : [];
        setAllProducts(products);
        
        // Calculate analytics
        const categoryCounts: Record<string, number> = {};
        let uncategorizedCount = 0;

        products.forEach((product: Product) => {
          if (!product.category || product.category === 'Uncategorized') {
            uncategorizedCount++;
          } else {
            categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
          }
        });

        // Get recent products (last 5)
        const recentProducts = [...products]
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);

        setAnalytics({
          totalProducts: products.length,
          categoryCounts,
          recentProducts,
          uncategorizedCount
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = allProducts.filter(product => {
      const searchableFields = [
        product.name || '',
        product.description || '',
        product.barcode || '',
        product.category || ''
      ].map(field => field.toLowerCase());

      return searchableFields.some(field => field.includes(query));
    });
    
    setFilteredProducts(results);
  }, [searchQuery, allProducts]);

  return (
    <AuthWrapper>
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Inventory Analytics</h1>
          <Link 
            href="/scanner" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Scanner
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, description, barcode, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 text-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Search Results */}
          {searchQuery.trim() !== '' && (
            <div className="mt-4 bg-white rounded-lg shadow-md">
              {filteredProducts.length > 0 ? (
                <div className="divide-y">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="p-4 hover:bg-gray-50">
                      <h3 className="font-medium text-orange-600">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.description}</p>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Barcode: {product.barcode}</span>
                        <span>Category: {product.category || 'Uncategorized'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No products found matching your search.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <h3 className="text-3xl text-gray-600 font-bold">{analytics.totalProducts}</h3>
              </div>
              <Package className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Categories</p>
                <h3 className="text-3xl text-gray-600 font-bold">{Object.keys(analytics.categoryCounts).length}</h3>
              </div>
              <Boxes className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Uncategorized</p>
                <h3 className="text-3xl text-gray-600 font-bold">{analytics.uncategorizedCount}</h3>
              </div> 
              <BarChart3 className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl text-gray-500 font-semibold mb-4">Category Distribution</h2>
            <div className="space-y-4">
              {Object.entries(analytics.categoryCounts).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-600 font-bold">{category}</span>
                  <div className="flex items-center">
                    <span className="text-gray-600 font-semibold">{count}</span>
                    <span className="text-gray-600 ml-2">items</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl text-gray-500 font-semibold mb-4">Recently Added Products</h2>
            <div className="space-y-4">
              {analytics.recentProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h3 className="font-medium text-orange-600">{product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.category || 'Uncategorized'}
                    </p>
                  </div>
                  <ArrowUpRight className="text-gray-400" size={20} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
    </AuthWrapper>
  );
}