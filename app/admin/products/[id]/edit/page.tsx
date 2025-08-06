'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Star, Eye } from 'lucide-react';
import Link from 'next/link';
import ColorSelector from '@/components/ui/ColorSelector';
import SizeSelector from '@/components/ui/SizeSelector';
import ColorImageManager from '@/components/ui/ColorImageManager';
import VariantInventoryGrid from '@/components/ui/VariantInventoryGrid';
import { ProductImage } from '@/types/product';
import { getAuth } from 'firebase/auth';
import { api } from '@/lib/api/client';

interface LocalProductImage extends ProductImage {
  file?: File;
  uploading?: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  category_id?: string;
  inventory_count: number;
  track_inventory: boolean;
  track_variants: boolean;
  allow_backorder: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: ProductImage[];
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    categoryId: '',
    inventoryCount: '',
    trackVariants: true,
    status: 'active',
    featured: false,
  });
  const [images, setImages] = useState<LocalProductImage[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [variantInventory, setVariantInventory] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // GET endpoint is public, no auth needed
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const productData = await response.json();
        console.log('Fetched product data:', productData);
        
        // Ensure we have valid product data
        if (!productData || !productData.id) {
          throw new Error('Invalid product data received');
        }
        
        setProduct(productData);

        // Populate form data with safe defaults
        setFormData({
          name: productData.name || '',
          slug: productData.slug || '',
          description: productData.description || '',
          shortDescription: productData.short_description || '',
          price: (productData.price || 0).toString(),
          comparePrice: productData.compare_price ? productData.compare_price.toString() : '',
          categoryId: productData.category_id || '',
          inventoryCount: (productData.inventory_count || 0).toString(),
          trackVariants: Boolean(productData.track_variants),
          status: productData.status || 'active',
          featured: Boolean(productData.featured),
        });

        // Set images with safe defaults
        setImages(Array.isArray(productData.images) ? productData.images : []);
        
        // Set variants with safe defaults
        setColors(Array.isArray(productData.colors) ? productData.colors : []);
        setSizes(Array.isArray(productData.sizes) ? productData.sizes : []);

        // If the product has variants, fetch variant inventory
        if (productData.track_variants) {
          await fetchVariantInventory();
        }

      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchVariantInventory = async () => {
    try {
      // Check if variants endpoint exists and fetch inventory
      const response = await fetch(`/api/products/${productId}/variants`);

      if (response.ok) {
        const result = await response.json();
        const inventoryData: {[key: string]: number} = {};
        
        // Handle both possible response formats
        const variants = result.data || result;
        if (Array.isArray(variants)) {
          variants.forEach((variant: any) => {
            const key = `${variant.color}-${variant.size}`;
            inventoryData[key] = variant.inventory_count || 0;
          });
        }
        
        setVariantInventory(inventoryData);
      }
    } catch (err) {
      console.error('Error fetching variant inventory:', err);
    }
  };

  // Update variant inventory when colors or sizes change
  const handleColorsChange = (newColors: string[]) => {
    setColors(newColors);
    
    if (formData.trackVariants) {
      const newInventory: {[key: string]: number} = {};
      
      newColors.forEach(color => {
        sizes.forEach(size => {
          const key = `${color}-${size}`;
          newInventory[key] = variantInventory[key] || 0;
        });
      });
      
      setVariantInventory(newInventory);
    }
  };

  const handleSizesChange = (newSizes: string[]) => {
    setSizes(newSizes);
    
    if (formData.trackVariants) {
      const newInventory: {[key: string]: number} = {};
      
      colors.forEach(color => {
        newSizes.forEach(size => {
          const key = `${color}-${size}`;
          newInventory[key] = variantInventory[key] || 0;
        });
      });
      
      setVariantInventory(newInventory);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleImageUpload = async (files: FileList, color?: string) => {
    const newImages: LocalProductImage[] = [];
    setError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        continue;
      }

      const tempId = `temp-${Date.now()}-${i}`;
      
      const tempImage: LocalProductImage = {
        id: tempId,
        publicId: tempId,
        secure_url: URL.createObjectURL(file),
        alt_text: `${formData.name || 'Product'} image ${images.length + i + 1}`,
        is_primary: images.length === 0 && i === 0,
        order: images.length + i,
        color: color,
        file,
        uploading: false,
      };

      newImages.push(tempImage);
    }

    setImages(prev => [...prev, ...newImages]);
    
    if (error && error.includes('upload at least one product image')) {
      setError(null);
    }
    if (validationErrors.images) {
      setValidationErrors(prev => ({ ...prev, images: '' }));
    }
    
    return newImages;
  };

  const uploadImageToCloudinary = async (image: LocalProductImage): Promise<LocalProductImage> => {
    if (!image.file) throw new Error('No file to upload');

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required. Please sign in and try again.');
    }
    
    const token = await user.getIdToken();

    const formData = new FormData();
    formData.append('file', image.file);
    formData.append('folder', 'products');

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload image';
      try {
        const result = await response.json();
        errorMessage = result.error || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();

    return {
      ...image,
      id: result.data.publicId,
      publicId: result.data.publicId,
      secure_url: result.data.secureUrl,
      file: undefined,
      uploading: false,
    };
  };

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      if (filtered.length > 0 && !filtered.some(img => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const setPrimaryImage = (imageId: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      is_primary: img.id === imageId
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setValidationErrors({});

    const errors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }

    if (images.length === 0) {
      errors.images = 'Please upload at least one product image';
    }

    if (colors.length === 0) {
      errors.colors = 'At least one color is required';
    }
    if (sizes.length === 0) {
      errors.sizes = 'At least one size is required';
    }

    const imageColors = images.filter(img => img.color).map(img => img.color);
    const invalidColors = imageColors.filter(color => color && !colors.includes(color));
    if (invalidColors.length > 0) {
      errors.images = `Images reference colors not in the color list: ${invalidColors.join(', ')}`;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      setError(firstError);
      setSaving(false);
      return;
    }

    try {
      // Upload new images (those with file property)
      const uploadedImages: ProductImage[] = [];
      
      for (const image of images) {
        if (image.file) {
          setImages(prev => prev.map(img =>
            img.id === image.id ? { ...img, uploading: true } : img
          ));
          
          try {
            const uploadedImage = await uploadImageToCloudinary(image);
            uploadedImages.push(uploadedImage);
            
            setImages(prev => prev.map(img =>
              img.id === image.id ? uploadedImage : img
            ));
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError);
            const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
            setError(`Failed to upload images. ${errorMessage}`);
            setSaving(false);
            return;
          }
        } else {
          // Include existing images
          if (!image.secure_url.startsWith('blob:')) {
            uploadedImages.push(image);
          }
        }
      }

      if (uploadedImages.length === 0) {
        setError('No images were successfully processed. Please try uploading images again.');
        setSaving(false);
        return;
      }

      const updateData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        categoryId: formData.categoryId || undefined,
        inventoryCount: parseInt(formData.inventoryCount) || 0,
        trackVariants: formData.trackVariants,
        variantInventory: formData.trackVariants ? variantInventory : undefined,
        status: formData.status,
        featured: formData.featured,
        images: uploadedImages.map(img => ({
          id: img.id,
          secure_url: img.secure_url,
          publicId: img.publicId,
          width: 1200,
          height: 1200,
          format: 'jpg',
          color: img.color || undefined,
          is_primary: img.is_primary,
        })),
        colors,
        sizes,
        tags: [],
      };

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Authentication required. Please sign in and try again.');
      }
      
      const token = await user.getIdToken();

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const result = await response.json();

        if (response.status === 400 && result.details) {
          const validationErrors: {[key: string]: string} = {};
          result.details.forEach((detail: any) => {
            const field = detail.path?.[0] || 'general';
            validationErrors[field] = detail.message;
          });
          setValidationErrors(validationErrors);
          throw new Error('Please fix the validation errors and try again');
        }

        throw new Error(result.error || 'Failed to update product');
      }

      // Redirect back to products list
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-gold">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <Link
                href="/admin/products"
                className="px-6 py-2 bg-gold text-black rounded hover:bg-gold/80 transition-colors"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/products"
              className="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Products
            </Link>
            <div className="h-6 w-px bg-gold/30" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gold">
              Edit Product
            </h1>
          </div>
          {product && (
            <div className="flex items-center gap-3">
              <Link
                href={`/product/${product.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-charcoal border border-gold/20 text-gray-300 hover:text-white hover:border-gold/40 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Product
              </Link>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-charcoal rounded-lg border border-gold/20 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  placeholder="Enter product name"
                />
              </div>

              {/* Slug */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  placeholder="product-url-slug"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Compare Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Compare Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.comparePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, comparePrice: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Inventory Count */}
              {!formData.trackVariants ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Inventory Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.inventoryCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, inventoryCount: e.target.value }))}
                    className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                    placeholder="0"
                  />
                </div>
              ) : (
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-charcoal/40 to-charcoal/20 rounded-xl border border-gold/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-gold/30 to-gold/10 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Variant Inventory Management</h3>
                        <p className="text-sm text-gray-400">Set individual inventory levels for each color/size combination</p>
                      </div>
                    </div>
                    
                    {colors.length > 0 && sizes.length > 0 ? (
                      <VariantInventoryGrid
                        colors={colors}
                        sizes={sizes}
                        inventoryData={variantInventory}
                        onChange={setVariantInventory}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p className="text-sm">Add colors and sizes above to configure variant inventory</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Variant Tracking Toggle */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-charcoal/40 to-charcoal/20 rounded-xl border border-gold/20 p-6">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={formData.trackVariants}
                        onChange={(e) => setFormData(prev => ({ ...prev, trackVariants: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        formData.trackVariants
                          ? 'bg-gold border-gold'
                          : 'bg-black border-gold/30 group-hover:border-gold/50'
                      }`}>
                        {formData.trackVariants && (
                          <svg className="w-3 h-3 text-black absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">Track Variant-Level Inventory</span>
                        <div className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full font-medium">
                          RECOMMENDED
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Enable granular inventory tracking for each color and size combination. 
                        This allows precise stock management and prevents overselling of specific variants.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Short Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                  placeholder="Brief product description"
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-gold/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                  placeholder="Detailed product description"
                />
              </div>

              {/* Enhanced Color-Specific Image Management */}
              <div className="lg:col-span-2">
                <ColorImageManager
                  images={images}
                  colors={colors}
                  onChange={setImages}
                  onUpload={handleImageUpload}
                  error={validationErrors.images}
                />
              </div>

              {/* Product Variants */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-charcoal/40 to-charcoal/20 rounded-xl border border-gold/20 p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-gold/30 to-gold/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Product Variants</h3>
                      <p className="text-gray-400">Configure available colors and sizes for this product</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Colors */}
                    <div className="bg-black/20 rounded-lg p-6 border border-gold/10">
                      <ColorSelector
                        colors={colors}
                        onChange={handleColorsChange}
                        error={validationErrors.colors}
                      />
                    </div>

                    {/* Sizes */}
                    <div className="bg-black/20 rounded-lg p-6 border border-gold/10">
                      <SizeSelector
                        sizes={sizes}
                        onChange={handleSizesChange}
                        error={validationErrors.sizes}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Product */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-r from-charcoal/40 to-charcoal/20 rounded-xl border border-gold/20 p-6">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                        formData.featured
                          ? 'bg-gold border-gold'
                          : 'bg-black border-gold/30 group-hover:border-gold/50'
                      }`}>
                        {formData.featured && (
                          <Star className="w-3 h-3 text-black absolute top-0.5 left-0.5" fill="currentColor" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">Featured Product</span>
                        <div className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full font-medium">
                          PREMIUM
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Featured products appear prominently on the homepage and get priority in search results
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 pt-8 mt-8 border-t border-gold/30">
              <Link
                href="/admin/products"
                className="px-8 py-3 text-gray-300 hover:text-white hover:bg-charcoal/50 rounded-xl transition-all duration-200 font-medium order-2 sm:order-1 border border-gray-600 hover:border-gray-500 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="relative px-10 py-3 bg-gradient-to-r from-gold to-gold/90 text-black rounded-xl font-semibold hover:from-gold/90 hover:to-gold/80 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200 order-1 sm:order-2 min-w-[180px] shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Update Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}