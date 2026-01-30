import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from '@shop-builder/shared';
import { useCartStore } from '@entities/cart/model/cartStore';

export const OrderSuccess: React.FC = () => {
  const { lastOrder, clearLastOrder, setCartOpen } = useCartStore();

  const handleClose = () => {
    clearLastOrder();
    setCartOpen(false);
  };

  return (
    <Dialog open={!!lastOrder} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <DialogTitle className="text-center">Заказ оформлен!</DialogTitle>
          <DialogDescription className="text-center">
            Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Номер заказа</p>
            <p className="text-lg font-mono font-bold text-gray-900">
              #{lastOrder?.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {lastOrder && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Сумма заказа:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(
                    lastOrder.total
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Товаров:</span>
                <span className="font-medium">
                  {lastOrder.items.reduce((sum, item) => sum + item.quantity, 0)} шт.
                </span>
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleClose} className="w-full mt-4">
          Продолжить покупки
        </Button>
      </DialogContent>
    </Dialog>
  );
};
