'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import ProductsTable from '@/components/dashboard/ProductsTable';
import CreateProductModal from '@/components/dashboard/CreateProductModal';
import { api } from '@/lib/api/client';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  inventory_count: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  category_name?: string;
  images: any[];
  created_at: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      console.log('Fetching products with params:', params.toString());
      
      const result = await api.get(`/api/products?${params.toString()}`);
      
      console.log('Products API response:', result);
      console.log('Products data:', result.data);
      console.log('Products count:', result.data?.length || 0);
      
      setProducts(result.data || []);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchProducts();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gold">Product Management</h1>
          <p className="text-gray-400 mt-1">Manage your product catalog</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center justify-center sm:justify-start"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-charcoal rounded-lg p-4 sm:p-6 border border-gold/20">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products by name or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 bg-black border border-gold/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-gold"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-black border border-gold/20 rounded-md text-white focus:outline-none focus:border-gold appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="btn-secondary px-6 py-2"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <ProductsTable products={filteredProducts} onProductUpdate={fetchProducts} />

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}