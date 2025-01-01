import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Component {...pageProps} />
    </UserProvider>
  );
}
