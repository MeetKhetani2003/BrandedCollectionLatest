"use client";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const [count, setCount] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => c - 1);
    }, 1000);

    setTimeout(() => {
      window.location.href = "/";
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center p-20">
      <CheckCircle className="text-green-600 w-20 h-20 mx-auto" />
      <h1 className="text-3xl font-bold mt-4">Payment Successful 🎉</h1>
      <p className="opacity-60">Invoice will reach your email shortly</p>

      <p className="mt-6">Redirecting in {count} sec...</p>
    </div>
  );
}
