import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Checkbox,
  Spinner,
} from '@shop-builder/shared';
import type { Product } from '@shop-builder/shared';
import { useProductStore } from '@entities/product';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  storeId: string;
}

interface FormData {
  name: string;
  description: string;
  price: string;
  inventory: string;
  images: string[];
  isActive: boolean;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  price: '',
  inventory: '0',
  images: [],
  isActive: true,
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  storeId,
}) => {
  const { createProduct, updateProduct, isSaving, error, clearError } = useProductStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageUrl, setImageUrl] = useState('');

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        inventory: product.inventory.toString(),
        images: product.images || [],
        isActive: product.isActive,
      });
    } else {
      setFormData(initialFormData);
    }
    clearError();
  }, [product, isOpen, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      inventory: parseInt(formData.inventory),
      images: formData.images.length > 0 ? formData.images : undefined,
      isActive: formData.isActive,
    };

    try {
      if (isEditing && product) {
        await updateProduct(storeId, product.id, data);
      } else {
        await createProduct(storeId, data);
      }
      onClose();
    } catch {
      // Error is handled in store
    }
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()],
      }));
      setImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Название товара"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Описание товара"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (руб.) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory">Остаток (шт.)</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                value={formData.inventory}
                onChange={(e) => setFormData((prev) => ({ ...prev, inventory: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Изображения</Label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL изображения"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddImage}>
                Добавить
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="%23ccc"><rect width="64" height="64"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10">Error</text></svg>';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked as boolean }))
              }
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Товар активен (отображается в магазине)
            </Label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Spinner size="sm" className="mr-2" />}
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
