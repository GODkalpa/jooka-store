'use client';

import { useState } from 'react';
import { X, Save, Star } from 'lucide-react';
import ColorSelector from '@/components/ui/ColorSelector';
import SizeSelector from '@/components/ui/SizeSelector';
import ColorImageManager from '@/components/ui/ColorImageManager';
import VariantInventoryGrid from '@/components/ui/VariantInventoryGrid';
import { ProductImage } from '@/types/product';
import { getAuth } from 'firebase/auth';

interface LocalProductImage extends ProductImage {
  file?: File; // For preview before upload
  uploading?: boolean;
}

interface CreateProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProductModal({ onClose, onSuccess }: CreateProductModalProps) {
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

  // Update variant inventory when colors or sizes change
  const handleColorsChange = (newColors: string[]) => {
    setColors(newColors);
    
    // Update variant inventory to include new combinations and remove old ones
    if (formData.trackVariants) {
      const newInventory: {[key: string]: number} = {};
      
      newColors.forEach(color => {
        sizes.forEach(size => {
          const key = `${color}-${size}`;
          // Keep existing inventory or default to 0
          newInventory[key] = variantInventory[key] || 0;
        });
      });
      
      setVariantInventory(newInventory);
    }
  };

  const handleSizesChange = (newSizes: string[]) => {
    setSizes(newSizes);
    
    // Update variant inventory to include new combinations and remove old ones
    if (formData.trackVariants) {
      const newInventory: {[key: string]: number} = {};
      
      colors.forEach(color => {
        newSizes.forEach(size => {
          const key = `${color}-${size}`;
          // Keep existing inventory or default to 0
          newInventory[key] = variantInventory[key] || 0;
        });
      });
      
      setVariantInventory(newInventory);
    }
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});


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

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        continue;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        continue;
      }

      const tempId = `temp-${Date.now()}-${i}`;
      
      // Create a temporary image with blob URL for immediate preview
      const tempImage: LocalProductImage = {
        id: tempId,
        publicId: tempId,
        secure_url: URL.createObjectURL(file), // Temporary preview URL
        alt_text: `${formData.name || 'Product'} image ${images.length + i + 1}`,
        is_primary: images.length === 0 && i === 0, // First image is primary
        order: images.length + i,
        color: color,
        file, // Keep the file for upload
        uploading: false,
      };

      newImages.push(tempImage);
    }

    // Add images to state immediately for preview
    setImages(prev => [...prev, ...newImages]);
    
    // Clear any existing errors when images are added
    if (error && error.includes('upload at least one product image')) {
      setError(null);
    }
    if (validationErrors.images) {
      setValidationErrors(prev => ({ ...prev, images: '' }));
    }
    
    // Return the new images for the ColorImageManager (keep file data)
    return newImages;
  };

  const uploadImageToCloudinary = async (image: LocalProductImage): Promise<LocalProductImage> => {
    if (!image.file) throw new Error('No file to upload');

    // Get auth token
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('Authentication required. Please sign in and try again.');
    }
    
    console.log('Getting auth token for user:', user.uid);
    const token = await user.getIdToken();

    const formData = new FormData();
    formData.append('file', image.file);
    formData.append('folder', 'products');

    console.log('Uploading image:', image.file.name, 'Size:', image.file.size);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = 'Failed to upload image';
      try {
        const result = await response.json();
        errorMessage = result.error || errorMessage;
        console.error('Upload error response:', result);
        console.error('Upload error status:', response.status);
      } catch (e) {
        console.error('Failed to parse error response:', e);
        const text = await response.text();
        console.error('Raw error response:', text);
        console.error('Response status:', response.status);
      }
      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const result = await response.json();
    console.log('Upload success:', result);

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
      // If we removed the primary image, make the first remaining image primary
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

  const updateImageAltText = (imageId: string, altText: string) => {
    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, altText: altText } : img
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors({});

    // Validate required fields
    const errors: {[key: string]: string} = {};

    // Check basic required fields
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }

    // Check images first
    if (images.length === 0) {
      errors.images = 'Please upload at least one product image';
    }

    // Check variants
    if (colors.length === 0) {
      errors.colors = 'At least one color is required';
    }
    if (sizes.length === 0) {
      errors.sizes = 'At least one size is required';
    }

    // Validate that colors used in images exist in the colors array
    const imageColors = images.filter(img => img.color).map(img => img.color);
    const invalidColors = imageColors.filter(color => color && !colors.includes(color));
    if (invalidColors.length > 0) {
      errors.images = `Images reference colors not in the color list: ${invalidColors.join(', ')}`;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Set the first error as the main error message
      const firstError = Object.values(errors)[0];
      setError(firstError);
      setLoading(false);
      return;
    }

    try {
      console.log('Starting form submission with images:', images);
      
      // Upload all images to Cloudinary first
      const uploadedImages: ProductImage[] = [];
      
      for (const image of images) {
        console.log('Processing image:', image.id, 'has file:', !!image.file, 'secure_url:', image.secure_url);
        
        if (image.file) {
          // Update UI to show uploading state
          setImages(prev => prev.map(img =>
            img.id === image.id ? { ...img, uploading: true } : img
          ));
          
          try {
            console.log('Uploading image with file:', image.file.name);
            const uploadedImage = await uploadImageToCloudinary(image);
            uploadedImages.push(uploadedImage);
            console.log('Successfully uploaded:', uploadedImage.secure_url);
            
            // Update UI with uploaded image
            setImages(prev => prev.map(img =>
              img.id === image.id ? uploadedImage : img
            ));
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError);
            const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
            setError(`Failed to upload images. ${errorMessage}`);
            setLoading(false);
            return;
          }
        } else {
          // Include images that already have real URLs (not blob URLs)
          if (!image.secure_url.startsWith('blob:')) {
            console.log('Including already uploaded image:', image.secure_url);
            uploadedImages.push(image);
          } else {
            console.log('Skipping blob URL image:', image.secure_url);
          }
        }
      }

      console.log('Final uploaded images count:', uploadedImages.length);
      console.log('Final uploaded images:', uploadedImages);

      // Final check - ensure we have at least one successfully uploaded image
      if (uploadedImages.length === 0) {
        setError('No images were successfully processed. Please try uploading images again.');
        setLoading(false);
        return;
      }

      const productData = {
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
          width: 1200, // Default width from upload
          height: 1200, // Default height from upload
          format: 'jpg', // Default format
          color: img.color || undefined,
          is_primary: img.is_primary,
        })),
        colors,
        sizes,
        tags: [],
      };

      console.log('Product data being sent:', {
        ...productData,
        colorsCount: colors.length,
        sizesCount: sizes.length,
        imagesCount: uploadedImages.length,
        imageColors: uploadedImages.map(img => img.color).filter(Boolean),
      });

      // Get auth token for product creation
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user found for product creation');
        throw new Error('Authentication required. Please sign in and try again.');
      }
      
      console.log('Getting auth token for product creation, user:', user.uid);
      const token = await user.getIdToken();

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const result = await response.json();

        // Handle validation errors specifically
        if (response.status === 400 && result.details) {
          const validationErrors: {[key: string]: string} = {};
          result.details.forEach((detail: any) => {
            const field = detail.path?.[0] || 'general';
            validationErrors[field] = detail.message;
          });
          setValidationErrors(validationErrors);
          throw new Error('Please fix the validation errors and try again');
        }

        throw new Error(result.error || 'Failed to create product');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-charcoal rounded-lg sm:rounded-xl border border-gold/30 w-full max-w-4xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20 bg-charcoal/80">
          <h2 className="text-2xl font-semibold text-gold">Create New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gold transition-colors p-2 hover:bg-gold/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
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
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-8 py-3 text-gray-300 hover:text-white hover:bg-charcoal/50 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1 border border-gray-600 hover:border-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="relative px-10 py-3 bg-gradient-to-r from-gold to-gold/90 text-black rounded-xl font-semibold hover:from-gold/90 hover:to-gold/80 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200 order-1 sm:order-2 min-w-[180px] shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Create Product</span>
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