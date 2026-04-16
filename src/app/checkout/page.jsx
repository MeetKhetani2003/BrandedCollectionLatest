"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  X,
  ChevronRight,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import gsap from "gsap";

const PALETTE = {
  BG: "bg-[#fff9f4]",
  BORDER: "border-[#deb887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321] text-white hover:bg-[#7a4a27]",
  INACTIVE: "bg-gray-200 text-gray-500",
};

export default function CheckoutPage() {
  const { user, getUser, setUser } = useUserStore();
  const { cart, fetchCart, updateQty, removeFromCart } = useCartStore();

  const [currentStep, setCurrentStep] = useState(1); // 1: Cart, 2: Address, 3: Payment
  const [addressModal, setAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [phoneModal, setPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.number || "");
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  useEffect(() => {
    fetchCart();
    getUser();
    gsap.from(".step-content", { opacity: 0, x: 20, duration: 0.4 });

    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      document.body.appendChild(script);
    }
  }, [currentStep]);
  useEffect(() => {
    if (user?.number) {
      setPhoneNumber(user.number);
    }
  }, [user]);
  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.qty,
    0,
  );
  const delivery = subtotal > 999 ? 0 : 69;
  const total = subtotal + delivery;

  const nextStep = () => {
    if (currentStep === 2) {
      if (!phoneNumber || phoneNumber.trim() === "") {
        toast.error("Please add your phone number 📱");
        return;
      }

      if (!user?.addresses || user.addresses.length === 0) {
        toast.error("Please add a delivery address 📍");
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };
  const savePhoneNumber = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      return toast.error("Enter valid phone number");
    }

    const cleanNumber = phoneNumber.trim();

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: cleanNumber,
      }),
    });

    if (!res.ok) return toast.error("Failed to update phone");

    setUser({
      ...user,
      number: cleanNumber,
    });

    setPhoneNumber(cleanNumber);

    toast.success("Phone number saved ✅");
  };
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  // ... (saveAddress and handlePayment functions remain exactly the same as your code)

  const saveAddress = async () => {
    if (!newAddress.street || !newAddress.city)
      return toast.error("Enter full address!");
    const updatedAddresses = [...(user?.addresses || []), newAddress];
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addresses: updatedAddresses,
        defaultAddress: updatedAddresses.length - 1,
      }),
    });
    if (!res.ok) return toast.error("Failed saving address");
    setUser({
      ...user,
      addresses: updatedAddresses,
      defaultAddress: updatedAddresses.length - 1,
    });
    setSelectedAddress(updatedAddresses.length - 1);
    setAddressModal(false);
    toast.success("Address Saved 🎉");
  };

  const handlePayment = async () => {
    // validate phone number before payment
    if (!user?.number || user.number.trim() === "") {
      setPhoneModal(true);
      toast.error("Please add your phone number first 📱");
      return;
    }

    if (!user) return toast.error("Login Required!");

    const selected = user.addresses[selectedAddress];

    try {
      // ✅ STEP 1: Create reservation (locks stock for 15 minutes)
      const reservationRes = await fetch("/api/reservation", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          amount: total,
          address: {
            ...selected,
            phone: user.number,
          },
        }),
      });

      const reservationData = await reservationRes.json();

      if (!reservationData.success) {
        toast.error(reservationData.message || "Failed to reserve items");
        return;
      }

      // ✅ STEP 2: Open Razorpay with reservation ID
      const razor = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: reservationData.amount * 100, // Convert to paise
        currency: "INR",
        order_id: reservationData.razorpayOrderId,
        name: "Branded Collection",
        prefill: {
          name: user.firstName || user.username || "",
          contact: user.number || "",
        },

        handler: async function (response) {
          // ✅ STEP 3: Verify payment with reservation ID
          const verifyRes = await fetch("/api/checkout/verify-payment", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              reservationId: reservationData.reservationId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            toast.success("Payment Successful 🎉");
            window.location.href = "/checkout/success";
          } else {
            // ✅ Payment failed - cancel reservation and restore stock
            await fetch(
              `/api/reservation?id=${reservationData.reservationId}`,
              {
                method: "DELETE",
                credentials: "include",
              },
            );
            toast.error(
              verifyData.message || "Payment failed. Stock restored.",
            );
            await fetchCart(); // Refresh cart
          }
        },

        modal: {
          ondismiss: async function () {
            // ✅ User closed payment modal - cancel reservation
            await fetch(
              `/api/reservation?id=${reservationData.reservationId}`,
              {
                method: "DELETE",
                credentials: "include",
              },
            );
            toast.error("Payment cancelled. Stock restored.");
            await fetchCart(); // ✅ Refresh cart to show updated stock
          },
        },
      });

      razor.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment failed. Please try again.");
    }
  };

  if (!cart.length)
    return (
      <div className="text-center py-20 text-lg">🛒 Your cart is empty.</div>
    );

  return (
    <div className={`min-h-screen pb-10 ${PALETTE.BG}`}>
      {/* STEP PROGRESS BAR */}
      <div className="max-w-4xl mx-auto pt-10 px-6">
        <div className="flex items-center justify-between mb-10 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
          {[
            { id: 1, label: "Cart", icon: ShoppingBag },
            { id: 2, label: "Address", icon: MapPin },
            { id: 3, label: "Payment", icon: CreditCard },
          ].map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= s.id
                    ? PALETTE.ACCENT
                    : "bg-white border-2 border-gray-200 text-gray-400"
                }`}
              >
                <s.icon size={18} />
              </div>
              <span
                className={`text-xs font-bold ${currentStep >= s.id ? PALETTE.TEXT : "text-gray-400"}`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 step-content">
        {/* STEP 1: CART ITEMS */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className={`text-2xl font-bold ${PALETTE.TEXT}`}>
              Review Your Cart
            </h2>
            {cart.map(
              (item) => (
                console.log(item),
                (
                  <div
                    key={item._id + item.selectedSize}
                    className="border bg-white p-4 rounded-xl flex justify-between items-center shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <Image
                        src={
                          item.imageFrontPath?.startsWith("/api")
                            ? item.imageFrontPath
                            : `/api/images/${item.imageFrontPath}`
                        }
                        width={70}
                        height={70}
                        alt=""
                        className="rounded-lg object-cover"
                      />
                      <div>
                        <p className={`font-semibold ${PALETTE.TEXT}`}>
                          {item.name}
                        </p>
                        <p className="text-xs opacity-60">
                          Size: {item.selectedSize} | Price: ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-full border">
                        <Minus
                          className="w-4 cursor-pointer"
                          onClick={() =>
                            updateQty(
                              item._id,
                              item.selectedSize,
                              Math.max(1, item.qty - 1),
                            )
                          }
                        />
                        <span className="font-bold">{item.qty}</span>
                        <Plus
                          className="w-4 cursor-pointer"
                          onClick={() =>
                            updateQty(item._id, item.selectedSize, item.qty + 1)
                          }
                        />
                      </div>
                      <Trash2
                        className="text-red-500 w-5 cursor-pointer"
                        onClick={() =>
                          removeFromCart(item._id, item.selectedSize)
                        }
                      />
                    </div>
                  </div>
                )
              ),
            )}
            <button
              onClick={nextStep}
              className={`${PALETTE.ACCENT} w-full py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2`}
            >
              Continue to Address <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: ADDRESS SELECTION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
              <p className="font-semibold">Phone Number</p>
              {!phoneNumber ? (
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="border p-3 rounded-xl flex-1"
                  />

                  <button
                    onClick={savePhoneNumber}
                    className={`${PALETTE.ACCENT} px-4 rounded-xl`}
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-green-600 font-medium">{phoneNumber} ✓</p>
              )}
            </div>
            <div className="flex justify-between items-end">
              <h2 className={`text-2xl font-bold ${PALETTE.TEXT}`}>
                Delivery Address
              </h2>
              <button
                className="text-[#654321] font-bold underline text-sm"
                onClick={() => setAddressModal(true)}
              >
                + Add New Address
              </button>
            </div>

            <div className="grid gap-4">
              {user?.addresses?.map((addr, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedAddress(index)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddress === index ? "border-[#654321] bg-[#fffaf5]" : "border-gray-100 bg-white"}`}
                >
                  <p className="font-bold">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm opacity-70">
                    {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-bold"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                className={`flex-[2] ${PALETTE.ACCENT} py-4 rounded-xl font-bold`}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER SUMMARY & PAYMENT */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className={`text-2xl font-bold ${PALETTE.TEXT}`}>
              Order Summary
            </h2>
            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
              <div className="flex justify-between text-lg">
                <span>Subtotal</span> <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Delivery</span>{" "}
                <span className="text-green-600">
                  {delivery === 0 ? "FREE" : `₹${delivery}`}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-2xl font-bold ${PALETTE.TEXT}">
                <span>Total Amount</span> <span>₹{total}</span>
              </div>
            </div>

            <div className="bg-[#fdf3e7] border border-[#deb887] p-4 rounded-xl">
              <p className="text-xs font-bold uppercase opacity-50 mb-1">
                Delivering to:
              </p>
              <p className="text-sm">
                {user.addresses[selectedAddress]?.street},{" "}
                {user.addresses[selectedAddress]?.city}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="flex-1 py-4 border-2 border-gray-200 rounded-xl font-bold"
              >
                Back
              </button>
              <button
                onClick={handlePayment}
                className={`flex-[2] ${PALETTE.ACCENT} py-4 rounded-xl font-bold`}
              >
                Pay ₹{total} via Razorpay
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADDRESS MODAL (Keep your existing modal code here) */}
      {addressModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 w-[400px] rounded-2xl shadow-2xl relative">
            <X
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setAddressModal(false)}
            />
            <h3 className="font-bold text-xl mb-6">Add New Address</h3>
            <div className="space-y-3">
              {["street", "city", "state", "postalCode"].map((field) => (
                <input
                  key={field}
                  placeholder={field.replace(/^\w/, (c) => c.toUpperCase())}
                  className="border-2 border-gray-100 p-3 rounded-xl w-full focus:border-[#654321] outline-none transition-all"
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, [field]: e.target.value })
                  }
                />
              ))}
              <button
                onClick={saveAddress}
                className={`${PALETTE.ACCENT} w-full py-4 rounded-xl font-bold mt-4`}
              >
                Save & Use Address
              </button>
            </div>
          </div>
        </div>
      )}
      {phoneModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 w-[380px] rounded-2xl shadow-2xl relative">
            <X
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setPhoneModal(false)}
            />

            <h3 className="font-bold text-xl mb-4">Add Phone Number</h3>

            <p className="text-sm text-gray-500 mb-4">
              Phone number is required for order updates and delivery.
            </p>

            <input
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border-2 border-gray-100 p-3 rounded-xl w-full focus:border-[#654321] outline-none"
            />

            <button
              onClick={savePhoneNumber}
              className={`${PALETTE.ACCENT} w-full py-3 rounded-xl font-bold mt-4`}
            >
              Save Phone Number
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
