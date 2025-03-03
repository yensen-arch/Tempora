import { NextPage } from "next";
import Head from "next/head";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const terms: NextPage = () => {
  return (
    <>
      <Navbar />
      <div className="mt-20">
        <Head>
          <title>Terms & Conditions</title>
        </Head>
        <main className="bg-[#f4f1ea] text-[#3e2723] font-serif p-8 max-w-4xl mx-auto shadow-lg rounded-lg border border-[#d7ccc8]">
          <h1 className="text-4xl font-bold text-center mb-6 border-b-2 pb-2 border-[#8d6e63]">
            Terms & Conditions
          </h1>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Privacy Policy</h2>
            <p className="italic">Effective Date: 15th March 2025</p>
            <ol className="list-decimal list-inside space-y-2 mt-4">
              <li>
                <strong>Tempora values your privacy.</strong> This Privacy
                Policy outlines how we collect, use, and protect your
                information when you use our website and services.
              </li>
              <li>
                <strong>Information We Collect</strong>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>
                    <strong>Personal Information:</strong> Name, email, shipping
                    address, and payment details.
                  </li>
                  <li>
                    <strong>Uploaded Content:</strong> Securely stored
                    audio/video files.
                  </li>
                  <li>
                    <strong>Automated Data Collection:</strong> Cookies and
                    analytics tools for better services.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Your Rights</strong>
                <p>
                  You may request access, correction, or deletion of your data
                  by contacting us at{" "}
                  <span className="underline">tempora.life@gmail.com</span>.
                </p>
              </li>
            </ol>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Terms of Service</h2>
            <p className="italic">Effective Date: [Date]</p>
            <ol className="list-decimal list-inside space-y-2 mt-4">
              <li>
                <strong>Agreement to Terms</strong>
                <p>
                  By using our website and services, you agree to these Terms.
                </p>
              </li>
              <li>
                <strong>Services Provided</strong>
                <p>
                  We offer an online editor for audio/video, which is then
                  converted into a custom vinyl record.
                </p>
              </li>
              <li>
                <strong>Order Processing & Access</strong>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>Access is granted upon successful payment.</li>
                  <li>Orders are final once submitted for production.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Return Policy</h2>
            <ol className="list-decimal list-inside space-y-2 mt-4">
              <li>
                <strong>30-Day Return Eligibility</strong>
                <p>
                  We offer a 30-day return policy for defective or damaged
                  records.
                </p>
              </li>
              <li>
                <strong>Return Process</strong>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  <li>
                    Contact us at{" "}
                    <span className="underline">tempora.life@gmail.com</span>{" "}
                    with your order details.
                  </li>
                  <li>Provide proof of defect.</li>
                  <li>We will provide a return shipping label if approved.</li>
                </ul>
              </li>
            </ol>
          </section>

          <p className="text-center mt-4">
            For inquiries, contact us at{" "}
            <span className="underline">tempora.life@gmail.com</span>.
          </p>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default terms;
