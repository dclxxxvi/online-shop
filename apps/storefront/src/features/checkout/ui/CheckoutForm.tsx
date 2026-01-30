import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
  Spinner,
} from '@shop-builder/shared';
import { useCartStore } from '@entities/cart/model/cartStore';
import { useStoreData } from '@entities/store/model/storeDataStore';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export const CheckoutForm: React.FC = () => {
  const { store } = useStoreData();
  const { isCheckoutOpen, setCheckoutOpen, isSubmitting, orderError, submitOrder, getTotal } =
    useCartStore();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Введите имя';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите телефон';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Введите адрес';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Введите город';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Введите индекс';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !store?.id) return;

    await submitOrder(store.id, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      country: 'RU',
    });
  };

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={setCheckoutOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Оформление заказа</DialogTitle>
          <DialogDescription>Заполните данные для доставки</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {orderError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {orderError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Имя *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Иван Иванов"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="example@mail.ru"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                placeholder="+7 (999) 123-45-67"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Адрес *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={handleInputChange('address')}
              placeholder="ул. Примерная, д. 1, кв. 1"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Город *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={handleInputChange('city')}
                placeholder="Москва"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Индекс *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange('postalCode')}
                placeholder="123456"
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Итого к оплате:</span>
              <span className="text-xl font-bold">
                {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(
                  getTotal()
                )}
              </span>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Оформление...
                </>
              ) : (
                'Оформить заказ'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
