"use client";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { EditHistoryProvider } from "../lib/context/EditHistoryContext";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EditHistoryProvider>
      <UserProvider>
        <Head>
          <title>Tempora</title>
        </Head>
        <Toaster position="top-right" reverseOrder={false} />
        <Elements stripe={stripePromise}>
          <Component {...pageProps} />
        </Elements>
      </UserProvider>
    </EditHistoryProvider>
  );
}