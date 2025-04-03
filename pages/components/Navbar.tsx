"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBag,
  Disc,
  Menu,
  X,
  ShoppingCart,
  User,
  Instagram,
  Facebook,
  TwitterIcon as TikTok,
  CloudCog,
} from "lucide-react";
// Directly import useUser from @auth0/nextjs-auth0/client
import { useUser } from "@auth0/nextjs-auth0/client";

const NavItem = ({
  href,
  icon: Icon,
  text,
  onClick,
}: {
  href?: string;
  icon: React.ElementType | string;
  text: string;
  onClick?: () => void;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.li className="w-full mb-4 lg:mb-0 lg:mr-6">
      <Link
        href={href || "#"}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className={`flex items-center text-gray-800 hover:text-black transition-colors duration-300 px-3 py-2 rounded-md ${
          isActive ? "bg-[#E0B780]" : "hover:bg-[#F0D29A]"
        }`}
      >
        {typeof Icon === "string" ? (
          <img src={Icon} alt={text} className="w-6 h-6 mr-2" />
        ) : (
          <Icon className="w-5 h-5 mr-2" />
        )}
        <span className="text-sm font-medium">{text}</span>
      </Link>
    </motion.li>
  );
};

const SocialIcon = ({
  href,
  icon: Icon,
}: {
  href: string;
  icon: React.ElementType;
}) => (
  <Link
    href={href}
    className="text-gray-800 hover:text-black transition-colors duration-300"
  >
    <Icon className="w-6 h-6" />
  </Link>
);

const Navbar: React.FC<{ productsRef: React.RefObject<HTMLDivElement> }> = ({
  productsRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isLoading, error } = useUser();
  const [userSaved, setUserSaved] = useState(false); //to avoid unnecessary save calls
  const router = useRouter();

  useEffect(() => {
    const saveUser = async () => {
      if (user && !userSaved) {
        try {
          const response = await fetch("/api/users/saveUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              auth0Id: user.sub,
              email: user.email,
              given_name: user.given_name,
              family_name: user.family_name,
            }),
          });
          if (response.status === 200) {
            setUserSaved(true);
          }
        } catch (error) {
          console.error("Error saving user:", error);
        }
      }
    };
    saveUser();
  }, [user, userSaved]);

  const springTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  };
  const pathname = usePathname();

  return (
    <nav className="relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl text-black cursor-pointer">
              Tempora
            </Link>
          </div>
          <div className="hidden lg:flex lg:items-center">
            <ul className="flex space-x-4">
              <NavItem href="/" icon={Home} text="Home" />
              <NavItem
                icon={ShoppingBag}
                text="Products"
                onClick={() => {
                  if (router.pathname !== "/") {
                    // Navigate to the home page, then scroll
                    router.push("/").then(() => {
                      // Delay to ensure navigation is complete before scrolling
                      setTimeout(() => {
                        // Access the productsRef on the home page
                        const productsSection =
                          document.getElementById("products-section");
                        if (productsSection) {
                          productsSection.scrollIntoView({
                            behavior: "smooth",
                          });
                        }
                      }, 200); // Adjust the delay as needed
                    });
                  } else {
                    // If already on the home page, just scroll
                    productsRef.current?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              />
              <NavItem href="/memories" icon={Disc} text="Memories" />
              {user && <NavItem href="/editor" icon={CloudCog} text="Editor" />}
            </ul>
          </div>
          <div className="hidden lg:flex lg:items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  <span className="text-lg font-medium text-gray-800 mr-4">
                    Welcome, {user.nickname}
                  </span>
                ) : null}
              </>
            )}

            <Link
              href="/cart"
              className={`text-black hover:text-gray-600 hover:bg-[#F0D29A] px-3 py-2 rounded-full transition-colors duration-300 ${
                pathname === "/cart" ? "bg-[#E0B780]" : ""
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-black hover:text-gray-600 hover:bg-[#F0D29A] px-3 py-2 rounded-full transition-colors duration-300"
              >
                <User className="w-5 h-5" />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg w-48">
                  <div
                    className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      window.location.href = user
                        ? "/api/auth/logout"
                        : "/api/auth/login";
                    }}
                  >
                    <p className="font-medium">{user ? "Logout" : "Login"}</p>
                  </div>
                  {user && (
                    <div
                      className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        window.location.href = "/profile";
                      }}
                    >
                      <p className="font-medium">Profile</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center lg:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="text-black hover:text-gray-600 focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={springTransition}
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg lg:hidden"
          >
            <div className="flex flex-col h-full justify-between p-4">
              <div>
                <div className="flex justify-end mb-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="text-black hover:text-pink-600 focus:outline-none"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>
                {!isLoading && user && typeof user.given_name === "string" && (
                  <div className="text-lg font-medium text-gray-800 mb-4">
                    Welcome, {user.given_name}
                  </div>
                )}
                <ul className="flex flex-col items-start space-y-2">
                  <NavItem href="/" icon={Home} text="Home" />
                  <NavItem
                    icon={ShoppingBag}
                    text="Products"
                    onClick={() => {
                      if (router.pathname !== "/") {
                        // Navigate to the home page, then scroll
                        router.push("/").then(() => {
                          // Delay to ensure navigation is complete before scrolling
                          setTimeout(() => {
                            productsRef.current?.scrollIntoView({
                              behavior: "smooth",
                            });
                          }, 500); // Adjust the delay as needed
                        });
                      } else {
                        // If already on the home page, just scroll
                        productsRef.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }
                    }}
                  />
                  <NavItem href="/memories" icon={Disc} text="Memories" />
                  {user && <NavItem href="/editor" icon={CloudCog} text="Editor" />}
                  <NavItem href="/cart" icon={ShoppingCart} text="Cart" />
                  <NavItem
                    href={user ? "/api/auth/logout" : "/api/auth/login"}
                    icon={User}
                    text={user ? "Logout" : "Login"}
                  />
                </ul>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <SocialIcon
                  href="https://www.instagram.com/tempora.life/profilecard/?igsh=N243azFseGpudGw5"
                  icon={Instagram}
                />
                <SocialIcon href="https://facebook.com" icon={Facebook} />
                <SocialIcon href="https://tiktok.com" icon={TikTok} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
