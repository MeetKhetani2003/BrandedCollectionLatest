import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

import ClientBridge from "./ClientBridge";

export const metadata = {
  metadataBase: new URL("https://brandedcollections.in"),
  title: {
    default: "Branded Collections Rajkot | Premium Fits, Everyday Comfort",
    template: "%s | Branded Collections Rajkot"
  },
  description: "Discover premium shirts, tees, and denim crafted for comfort and style at Branded Collections Rajkot. Your destination for everyday fashion.",
  keywords: ["Branded Collections", "Rajkot Clothing", "Premium Menswear", "Shirts", "Tees", "Denim", "Rajkot Fashion"],
  authors: [{ name: "Branded Collections Rajkot" }],
  creator: "Branded Collections Rajkot",
  publisher: "Branded Collections Rajkot",
  openGraph: {
    title: "Branded Collections Rajkot",
    description: "Premium fits, everyday comfort. Discover our range of shirts, tees, and denim.",
    url: "https://brandedcollections.in",
    siteName: "Branded Collections Rajkot",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/assets/logo.png",
        width: 800,
        height: 600,
        alt: "Branded Collections Rajkot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Branded Collections Rajkot",
    description: "Premium fits, everyday comfort. Discover our range of shirts, tees, and denim.",
    creator: "@branded_collection_rajkot",
    images: ["/assets/logo.png"],
  },
  alternates: {
    canonical: "https://brandedcollections.in",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "0Xs7zruYJWkR4BS34_nhJDD44kUaxqIgeye0deKgzLY",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        ></script>
      </head>
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          <ClientBridge>{children}</ClientBridge>
        </GoogleOAuthProvider>

        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#654321",
              color: "white",
              borderRadius: "8px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
