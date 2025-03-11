// pages/admin/dashboard.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import OrdersPanel from '../components/OrdersPanel';
import ConsumersPanel from '../components/ConsumersPanel';
import TabNavigation from '../components/TabNavigation';

const Dashboard: NextPage = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { id: 'orders', label: 'Orders' },
    { id: 'consumers', label: 'Consumers' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard</title>
        <meta name="description" content="Order and consumer management dashboard" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <TabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          {activeTab === 'orders' ? (
            <OrdersPanel />
          ) : (
            <ConsumersPanel />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;