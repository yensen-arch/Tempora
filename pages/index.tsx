import React, { useRef } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Navbar from "./components/Navbar";
import Carousel from "./components/Carousel";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Help from "./components/Help";
import Testimonials from "./components/Testimonials";
import Products from "./components/Products";
import Seasons from "./components/Seasons";


function Index() {
  const { user, error, isLoading } = useUser();
  const productsRef = useRef(null);
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5f0eb] text-[#9a8576]">
        <div className="font-serif italic">Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5f0eb] text-[#9a8576]">
        <div className="font-serif italic">{error.message}</div>
      </div>
    );


  return (
    <div className="flex flex-col min-h-screen">
      <div>
        <div className="absolute inset-0  opacity-5 pointer-events-none"></div>
        <Navbar productsRef={productsRef} />
        <main className="relative">
          {/* Carousel Section with Overlay */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[#e8e1d9]/30 mix-blend-multiply z-10"></div>
            <Carousel />
          </section>

          {/* Seasons Section */}
          <section className="relative ">
            <div className=" mx-auto">
              <div className="relative z-10">
                <Seasons />
              </div>
            </div>
          </section>

          {/* Help Section */}
          <section className="relative my-24 px-6 md:px-12">
            <div className=" mx-auto">
              <div className="relative z-10">
                <Help />
              </div>
            </div>
          </section>

          {/* Products Section */}
          <section  id="products-section" className="relative my-24 px-6 md:px-12 overflow-hidden">
            <div className=" mx-auto">
              <div className="relative z-10">
              <Products ref={productsRef} />
              </div>
            </div>
          </section>

          {/* Gallery Section */}
          <section className="relative my-24 px-6 md:px-12">
            <div className=" mx-auto">
              <div className="relative z-10">
                <Gallery />
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="relative my-24 px-6 md:px-12 overflow-hidden">
            <div className=" mx-auto">
              <div className="relative z-10">
                <Testimonials />
              </div>
              <div className="absolute top-0 left-0 w-1/3 h-64 bg-[#e8e1d9]/30 -z-10 transform -translate-x-1/4 -translate-y-1/4"></div>
            </div>
          </section>
        </main>
      </div>

      <div className="fixed bottom-0 right-0 w-full h-64 bg-[#e8e1d9]/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 translate-y-1/2"></div>
      <Footer />
    </div>
  );
}

export default Index;
