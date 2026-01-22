import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreStore } from '@entities/store';
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  slugify,
} from '@shop-builder/shared';

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { createStore, isLoading, error } = useStoreStore();
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSubdomain(slugify(newName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const store = await createStore({ name, subdomain });
      onClose();
      setName('');
      setSubdomain('');
      navigate(`/editor/${store.id}`);
    } catch {
      // Error is handled in store
    }
  };

  const handleClose = () => {
    onClose();
    setName('');
    setSubdomain('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать новый магазин</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Название магазина</Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Мой интернет-магазин"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Поддомен</Label>
            <Input
              id="subdomain"
              value={subdomain}
              onChange={(e) => setSubdomain(slugify(e.target.value))}
              placeholder="my-store"
              required
            />
            <p className="text-sm text-muted-foreground">
              {subdomain ? `${subdomain}.shopbuilder.com` : 'Адрес вашего магазина'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={!name || !subdomain}>
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
