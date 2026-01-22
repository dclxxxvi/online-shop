import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@entities/user';
import { Button } from '@shop-builder/shared';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Shop Builder</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-gray-600">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
};