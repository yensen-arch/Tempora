"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useUser } from "@auth0/nextjs-auth0/client";

function Profile() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [userType, setUserType] = useState<string | null>(null);

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
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <div className="bg-white self-center shadow-md rounded-lg p-6 mt-10 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center">Profile</h2>

        <div className="flex flex-col items-center mt-4">
          {/* Avatar */}
          <img
            src={pictureUrl || "/default-avatar.jpg"}
            alt="Profile"
            className="w-24 h-24 rounded-full border border-gray-300"
          />
          <div className="text-center mt-4 flex flex-col gap-4">
            <h3 className="text-lg font-semibold"> Name: {name}</h3>
            <p className="text-gray-600"><span className="font-semibold">Nick Name:</span> {nickName || "No bio available"}</p>
            <p className="text-gray-600"><span className="font-semibold">Email:</span> {email || "No bio available"}</p>
            <p className="text-gray-600"><span className="font-semibold">User Type:</span> {userType || "Loading..."}</p>

            {/* Show Dashboard button only for admin */}
            {userType === "admin" && (
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
