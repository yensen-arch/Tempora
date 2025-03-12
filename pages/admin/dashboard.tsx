import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";
import Head from "next/head";
import OrdersPanel from "../components/OrdersPanel";
import ConsumersPanel from "../components/ConsumersPanel";
import TabNavigation from "../components/TabNavigation";

const Dashboard = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("orders");
  const tabs = [
        { id: 'orders', label: 'Orders' },
        { id: 'consumers', label: 'Consumers' },
      ];

  useEffect(() => {
    if (user) {
      const fetchUserType = async () => {
        try {
          const res = await fetch(`/api/users/${user.sub}`);
          const data = await res.json();
          setUserType(data.userType);

          // Redirect if not admin
          if (data.userType !== "admin") {
            router.push("/");
          }
        } catch (error) {
          console.error("Error fetching user type:", error);
          router.push("/"); // Redirect in case of an error
        }
      };

      fetchUserType();
    }
  }, [user, router]);

  if (isLoading || userType === null) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

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