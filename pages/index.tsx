import React from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Navbar from "./components/Navbar";
import Carousel from "./components/Carousel";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Help from "./components/Help";
import Testimonials from "./components/Testimonials";
import Products from "./components/Products";
function index() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {" "}
        <Navbar />
        <Carousel />
        <Help />
        <Products />
        <Gallery />
        <Testimonials />
      </div>
      <Footer />
    </div>
  );
}

export default index;
