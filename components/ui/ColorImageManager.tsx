'use client';

import { useState, useCallback } from 'react';
import { Plus, X, Star, Upload, Palette, Image as ImageIcon, Move } from 'lucide-react';
import Image from 'next/image';
import { ProductImage, ColorImageGroup } from '@/types/product';

interface ColorImageManagerProps {
  images: ProductImage[];
  colors: string[];
  onChange: (images: ProductImage[]) => void;
  onUpload: (files: FileList, color?: string) => Promise<ProductImage[]>;
  error?: string;
}

// Helper function to group images by color
const groupImagesByColor = (images: ProductImage[]): ColorImageGroup[] => {
  const groups: { [key: string]: ProductImage[] } = {};
  
  images.forEach(image => {
    const colorKey = image.color || 'general';
    if (!groups[colorKey]) {
      groups[colorKey] = [];
    }
    groups[colorKey].push(image);
  });

  return Object.entries(groups).map(([color, images]) => ({
    color: color === 'general' ? 'General' : color,
    images: images.sort((a, b) => a.order - b.order),
    primaryImage: images.find(img => img.is_primary)
  }));
};

export default function ColorImageManager({ 
  images, 
  colors, 
  onChange, 
  onUpload, 
  error 
}: ColorImageManagerProps) {
  const [selectedColor, setSelectedColor] = useState<string>('general');
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const imageGroups = groupImagesByColor(images);
  const availableColors = ['general', ...colors];

  const handleFileUpload = useCallback(async (files: FileList, color?: string) => {
    if (!files.length) return;
    
    setUploading(true);
    try {
      const uploadedImages = await onUpload(files, color === 'general' ? undefined : color);
      const updatedImages = [...images, ...uploadedImages];
      onChange(updatedImages);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }, [images, onChange, onUpload]);

  const removeImage = useCallback((imageId: string) => {
    const filtered = images.filter(img => img.id !== imageId);
    // If we removed the primary image, make the first remaining image primary
    if (filtered.length > 0 && !filtered.some(img => img.is_primary)) {
      filtered[0].is_primary = true;
    }
    onChange(filtered);
  }, [images, onChange]);

  const setPrimaryImage = useCallback((imageId: string) => {
    const updated = images.map(img => ({
      ...img,
      is_primary: img.id === imageId
    }));
    onChange(updated);
  }, [images, onChange]);

  const updateImageColor = useCallback((imageId: string, newColor: string) => {
    const updated = images.map(img => 
      img.id === imageId 
        ? { ...img, color: newColor === 'general' ? undefined : newColor }
        : img
    );
    onChange(updated);
  }, [images, onChange]);

  const updateImageOrder = useCallback((imageId: string, newOrder: number) => {
    const updated = images.map(img => 
      img.id === imageId ? { ...img, order: newOrder } : img
    );
    onChange(updated);
  }, [images, onChange]);

  const handleDragStart = (imageId: string) => {
    setDraggedImage(imageId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetImageId: string) => {
    e.preventDefault();
    if (!draggedImage || draggedImage === targetImageId) return;

    const draggedImg = images.find(img => img.id === draggedImage);
    const targetImg = images.find(img => img.id === targetImageId);
    
    if (draggedImg && targetImg) {
      const updated = images.map(img => {
        if (img.id === draggedImage) {
          return { ...img, order: targetImg.order };
        }
        if (img.id === targetImageId) {
          return { ...img, order: draggedImg.order };
        }
        return img;
      });
      onChange(updated);
    }
    setDraggedImage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gold flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Color-Specific Images
        </h3>
        <div className="text-sm text-gray-400">
          {images.length} image{images.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Color Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gold/20 pb-4">
        {availableColors.map((color) => {
          const group = imageGroups.find(g => 
            (color === 'general' && g.color === 'General') || 
            (color !== 'general' && g.color === color)
          );
          const imageCount = group?.images.length || 0;
          
          return (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 ${
                selectedColor === color
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-gray-600 text-gray-300 hover:border-gold/50 hover:text-gold'
              }`}
            >
              <span className="capitalize">{color}</span>
              {imageCount > 0 && (
                <span className="bg-gold/20 text-gold text-xs px-2 py-1 rounded-full">
                  {imageCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gold/30 rounded-lg p-6 text-center hover:border-gold/50 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files, selectedColor)}
          className="hidden"
          id={`upload-${selectedColor}`}
          disabled={uploading}
        />
        <label
          htmlFor={`upload-${selectedColor}`}
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
            ) : (
              <Upload className="w-6 h-6 text-gold" />
            )}
          </div>
          <div>
            <p className="text-gold font-medium">
              Upload images for {selectedColor === 'general' ? 'general use' : selectedColor}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Drag and drop or click to select multiple images
            </p>
          </div>
        </label>
      </div>

      {/* Image Grid for Selected Color */}
      {(() => {
        const currentGroup = imageGroups.find(g => 
          (selectedColor === 'general' && g.color === 'General') || 
          (selectedColor !== 'general' && g.color === selectedColor)
        );
        
        if (!currentGroup || currentGroup.images.length === 0) {
          return (
            <div className="text-center py-8 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No images for {selectedColor === 'general' ? 'general use' : selectedColor}</p>
              <p className="text-sm mt-1">Upload some images to get started</p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentGroup.images.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(image.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, image.id)}
                className="relative group bg-charcoal/30 rounded-lg overflow-hidden border-2 border-transparent hover:border-gold/30 transition-all cursor-move"
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.secure_url}
                    alt={image.alt_text}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPrimaryImage(image.id)}
                        className={`p-2 rounded ${
                          image.is_primary
                            ? 'bg-gold text-black'
                            : 'bg-black/70 text-white hover:bg-gold/20'
                        }`}
                        title="Set as primary image"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeImage(image.id)}
                        className="p-2 bg-red-500/80 text-white rounded hover:bg-red-500"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Primary Badge */}
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-gold text-black text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                  
                  {/* Drag Handle */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Move className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                {/* Color Assignment */}
                <div className="p-3">
                  <select
                    value={image.color || 'general'}
                    onChange={(e) => updateImageColor(image.id, e.target.value)}
                    className="w-full text-xs bg-black/50 border border-gold/20 rounded px-2 py-1 text-white"
                  >
                    <option value="general">General</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Summary */}
      {imageGroups.length > 0 && (
        <div className="bg-charcoal/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gold mb-3">Image Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
            {imageGroups.map(group => (
              <div key={group.color} className="flex justify-between">
                <span className="text-gray-300">{group.color}:</span>
                <span className="text-white">{group.images.length} images</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
