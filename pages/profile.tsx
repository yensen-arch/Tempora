"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  FaUser,
  FaEnvelope,
  FaShoppingBag,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTruck,
  FaLeaf,
  FaFeather,
} from "react-icons/fa";

// Define the Order type to match your model
interface Order {
  _id: string;
  fileUrl: string;
  name: string;
  address: string;
  email: string;
  contactNumber: string;
  city: string;
  state: string;
  zipcode: string;
  products: any[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

// Slideshow images - replace with your actual images
const leftSlideImages = [
  "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
  "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
  "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
];

const rightSlideImages = [
  "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690697/v3_rdam3n.jpg",
  "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
  "https://res.cloudinary.com/dqh2tacov/image/upload/q_auto,f_auto,w_auto/v1734690928/v6_u0snfi.jpg",
];

function Profile() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [userType, setUserType] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [leftSlideIndex, setLeftSlideIndex] = useState(0);
  const [rightSlideIndex, setRightSlideIndex] = useState(0);

  // Auto-advance slideshows
  useEffect(() => {
    const leftInterval = setInterval(() => {
      setLeftSlideIndex((prev) => (prev + 1) % leftSlideImages.length);
    }, 3000);

    const rightInterval = setInterval(() => {
      setRightSlideIndex((prev) => (prev + 1) % rightSlideImages.length);
    }, 4000); // Slightly different timing for visual interest

    return () => {
      clearInterval(leftInterval);
      clearInterval(rightInterval);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNickName(user.nickname || "");
      setEmail(user.email || "");
      setPictureUrl(user.picture || "");

      // Fetch userType from API
      const fetchUserType = async () => {
        try {
          const res = await fetch(`/api/users/${user.sub}`);
          const data = await res.json();
          setUserType(data.userType);
        } catch (error) {
          console.error("Error fetching user type:", error);
        }
      };

      fetchUserType();

      // Fetch user orders
      const fetchOrders = async () => {
        if (user.email) {
          setIsLoadingOrders(true);
          try {
            const res = await fetch(
              `/api/orders/get_user_order?email=${user.email}`
            );
            const data = await res.json();

            if (data.orders) {
              setOrders(data.orders);
            }
          } catch (error) {
            console.error("Error fetching orders:", error);
          } finally {
            setIsLoadingOrders(false);
          }
        }
      };

      fetchOrders();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#f9f3ee]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#a67c52] border-r-transparent"></div>
          <p className="mt-4 text-[#a67c52] font-serif italic">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#f8e8c8] text-[#b38a50]";
      case "processing":
        return "bg-[#d8e8f0] text-[#5a7d9a]";
      case "shipped":
        return "bg-[#e8d8f0] text-[#8a5a9a]";
      case "delivered":
        return "bg-[#d8e8d0] text-[#5a8a50]";
      case "cancelled":
        return "bg-[#f0d8d8] text-[#9a5a5a]";
      default:
        return "bg-[#e8e8e8] text-[#707070]";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f3ee] text-[#5d4037] font-serif">
      <Navbar productsRef={undefined} />

      {/* Custom CSS for decorative elements */}
      <style jsx>{`
        .decorative-border {
          border: 1px solid #d7b89c;
          position: relative;
        }

        .decorative-border::before,
        .decorative-border::after {
          content: "";
          position: absolute;
          width: 20px;
          height: 20px;
          border: 1px solid #d7b89c;
        }

        .decorative-border::before {
          top: -5px;
          left: -5px;
          border-right: none;
          border-bottom: none;
        }

        .decorative-border::after {
          bottom: -5px;
          right: -5px;
          border-left: none;
          border-top: none;
        }

        .slideshow-container {
          position: relative;
          overflow: hidden;
          height: 400px;
          box-shadow: 0 4px 15px rgba(163, 126, 90, 0.2);
          transition: all 0.3s ease;
        }

        .slideshow-container:hover {
          box-shadow: 0 6px 20px rgba(163, 126, 90, 0.3);
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 1s ease;
        }

        .slide.active {
          opacity: 1;
        }

        .order-card {
          transition: all 0.3s ease;
          border-left: 3px solid #d7b89c;
        }

        .order-card:hover {
          transform: translateX(5px);
        }

        .fancy-divider {
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            #d7b89c,
            transparent
          );
          margin: 2rem 0;
          position: relative;
        }

        .fancy-divider::before {
          content: "❦";
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: #f9f3ee;
          padding: 0 10px;
          color: #a67c52;
        }
      `}</style>

      <div className="container mx-auto py-12 px-4">
        {/* Main content with slideshows */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Left Slideshow */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="slideshow-container rounded-lg overflow-hidden">
              {leftSlideImages.map((img, index) => (
                <div
                  key={`left-${index}`}
                  className={`slide ${
                    index === leftSlideIndex ? "active" : ""
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Decorative image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <FaLeaf className="text-[#a67c52] mx-1 animate-pulse" />
              <FaFeather className="text-[#d7b89c] mx-1" />
              <FaLeaf className="text-[#a67c52] mx-1 animate-pulse" />
            </div>
          </div>

          {/* Profile Info (Center) */}
          <div className="lg:w-2/4">
            <div className="decorative-border bg-white rounded-lg p-8 shadow-md">
              <h2 className="text-3xl font-light text-center mb-6 text-[#a67c52]">
                My Profile
              </h2>

              <div className="flex flex-col items-center">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-[#5d4037]">
                    {name}
                  </h3>

                  <div className="mt-4 flex items-center justify-center">
                    <FaUser className="text-[#a67c52] mr-2" />
                    <p className="text-[#7d6054]">
                      {nickName || "No nickname available"}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-center">
                    <FaEnvelope className="text-[#a67c52] mr-2" />
                    <p className="text-[#7d6054]">
                      {email || "No email available"}
                    </p>
                  </div>

                  {/* Show Dashboard button only for admin */}
                  {userType === "admin" && (
                    <button
                      onClick={() => router.push("/admin/dashboard")}
                      className="mt-6 px-6 py-2 bg-[#a67c52] text-white rounded-md shadow hover:bg-[#8a6642] transition-colors duration-300"
                    >
                      Go to Dashboard
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Slideshow */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="slideshow-container rounded-lg overflow-hidden">
              {rightSlideImages.map((img, index) => (
                <div
                  key={`right-${index}`}
                  className={`slide ${
                    index === rightSlideIndex ? "active" : ""
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Decorative image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <FaFeather className="text-[#d7b89c] mx-1" />
              <FaLeaf className="text-[#a67c52] mx-1 animate-pulse" />
              <FaFeather className="text-[#d7b89c] mx-1" />
            </div>
          </div>
        </div>

        {/* Fancy divider */}
        <div className="fancy-divider"></div>

        {/* Orders Section */}
        <div className="bg-white shadow-md rounded-lg p-8 decorative-border">
          <h2 className="text-3xl font-light text-center mb-8 text-[#a67c52]">
            <FaShoppingBag className="inline-block mr-2 mb-1" />
            My Orders
          </h2>

          {isLoadingOrders ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#a67c52] border-r-transparent"></div>
              <p className="mt-4 text-[#a67c52] italic">
                Fetching your orders...
              </p>
            </div>
          ) : orders.length > 0 ? (
            <div className="grid gap-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="order-card bg-[#faf6f1] p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-2">
                        <FaCalendarAlt className="text-[#a67c52] mr-2" />
                        <span className="text-sm text-[#7d6054]">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <div className="text-lg font-medium text-[#5d4037] mb-1">
                        Order: <span className="font-light">{order._id}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        <FaMoneyBillWave className="text-[#a67c52] mr-2" />
                        <span className="font-medium text-[#5d4037]">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-start mb-2">
                        <FaMapMarkerAlt className="text-[#a67c52] mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm text-[#7d6054]">
                          {order.address}, {order.city}, {order.state}{" "}
                          {order.zipcode}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaTruck className="text-[#a67c52] mr-2" />
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#faf6f1] rounded-lg">
              <FaShoppingBag className="mx-auto text-4xl text-[#d7b89c] mb-4 opacity-50" />
              <p className="text-[#7d6054] italic">
                You haven't placed any orders yet.
              </p>
              <p className="mt-2 text-sm text-[#a67c52]">
                When you do, they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
