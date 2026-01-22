import React, { useEffect } from 'react';
import { Header } from '@widgets/header';
import { Sidebar } from '@widgets/sidebar';
import { StoreList } from '@widgets/store-list';
import { StatsCards } from '@widgets/stats-cards';
import { useStoreStore } from '@entities/store';
import { useAuthStore } from '@entities/user';

const DashboardPage: React.FC = () => {
  const { fetchStores } = useStoreStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Добро пожаловать{user?.name ? `, ${user.name}` : ''}!
            </h1>
            <p className="text-gray-600 mt-1">Управляйте своими интернет-магазинами</p>
          </div>
          <StatsCards />
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Мои магазины</h2>
          </div>
          <StoreList />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;