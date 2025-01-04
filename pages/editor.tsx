import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useUser } from "@auth0/nextjs-auth0/client";
import EditSlider from "../pages/components/EditSlider";

function Editor() {
  const { user, isLoading } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-6">
        {isLoading && <div>Loading...</div>}
        {!isLoading && !user && (
          <div>You need to log in to access this page.</div>
        )}
        {!isLoading && user && <EditSlider email={user.email} />}
      </main>
      <Footer />
    </div>
  );
}

export default Editor;
