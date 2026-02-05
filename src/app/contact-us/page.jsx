"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";

// Matches your site's palette
const PALETTE = {
  BG: "bg-[#FAF0E6]",
  BORDER: "border-[#DEB887]",
  TEXT: "text-[#654321]",
  ACCENT: "bg-[#654321] text-white",
  LIGHT: "bg-white/70",
};

export default function ContactUs() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "", // Matches Schema Enum: "product", "complaint", "other"
    state: "",
    city: "",
    message: "",
  });

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setForm({
          name: "",
          email: "",
          phone: "",
          reason: "",
          state: "",
          city: "",
          message: "",
        });
      } else {
        toast.error(data.error || "TRANSMISSION_FAILED");
      }
    } catch (error) {
      toast.error("CONNECTION_ERROR");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      ref={containerRef}
      className={`${PALETTE.BG} ${PALETTE.TEXT} selection:bg-[#DEB887]/30 font-mono text-xs uppercase`}
    >
      {/* ================= EDITORIAL HERO ================= */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#654321]/30 z-10" />
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000"
            alt="Clothing Store"
            className="w-full h-full object-cover grayscale"
          />
        </motion.div>

        <div className="relative z-20 text-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <span className="text-[10px] tracking-[0.6em] text-white font-bold mb-6 block">
              // SARTORIAL_SUPPORT
            </span>
            <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-none">
              CONTACT_US
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ================= PREMIUM SPLIT SECTION ================= */}
      <section className="flex flex-col lg:flex-row relative z-30 -mt-20">
        {/* LEFT: FORM (Premium Design) */}
        <div className="lg:w-[55%] px-8 md:px-20 py-24 bg-white rounded-t-[4rem] lg:rounded-none">
          <div className="max-w-xl mx-auto w-full">
            <h2 className="text-3xl font-bold tracking-tighter underline decoration-[#DEB887] decoration-2 underline-offset-8">
              CONTACT_US
            </h2>

            <form onSubmit={submit} className="mt-16 space-y-12">
              {/* Row 1: Name & Email */}
              <div className="grid md:grid-cols-2 gap-10">
                <FloatingMonoInput
                  label="NAME"
                  required
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <FloatingMonoInput
                  required
                  label="EMAIL_ID"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                />
              </div>

              {/* Row 2: Phone & Reason */}
              <div className="grid md:grid-cols-2 gap-10">
                <FloatingMonoInput
                  required
                  label="MOBILE_NO"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
                <div className="relative group">
                  <select
                    className={`w-full bg-transparent border-b ${PALETTE.BORDER} py-3 appearance-none focus:outline-none transition-all text-[14px] font-mono text-[#654321] peer`}
                    value={form.reason}
                    required // Always required for this form
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                  >
                    <option value="" disabled hidden></option>
                    <option value="product">PRODUCT_INQUIRY</option>
                    <option value="complaint">SERVICE_COMPLAINT</option>
                    <option value="other">OTHER_SUPPORT</option>
                  </select>

                  <ChevronDown
                    className="absolute right-0 top-4 text-[#DEB887] pointer-events-none"
                    size={14}
                  />

                  {/* FLOATING LABEL WITH REQUIRED STAR */}
                  <label
                    className={`absolute left-0 tracking-[0.2em] uppercase pointer-events-none transition-all duration-300
        ${
          form.reason
            ? "-top-4 text-[10px] text-[#654321]"
            : "top-3 text-[14px] text-[#DEB887]"
        } 
        group-focus-within:-top-4 group-focus-within:text-[10px] group-focus-within:text-[#654321]`}
                  >
                    Inquiry Category{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
              </div>

              {/* Row 3: State & City (Added to match Mongoose Model) */}
              <div className="grid md:grid-cols-2 gap-10">
                <FloatingMonoInput
                  label="STATE"
                  value={form.state}
                  onChange={(v) => setForm({ ...form, state: v })}
                />
                <FloatingMonoInput
                  label="CITY"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                />
              </div>

              {/* Row 4: Message Box */}
              <div className="relative group min-h-[120px]">
                <textarea
                  placeholder=" "
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="peer w-full bg-transparent border-b border-[#DEB887]/50 py-3 focus:outline-none focus:border-[#654321] transition-all text-[14px] font-mono text-[#654321] placeholder-transparent resize-none overflow-hidden"
                />
                <label className="absolute left-0 top-3 text-[14px] tracking-[0.2em] text-[#DEB887] pointer-events-none transition-all peer-focus:-top-6 peer-focus:text-[#654321] peer-[:not(:placeholder-shown)]:-top-6 uppercase">
                  MESSAGE_TRANSMISSION{" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>

              <button
                disabled={loading}
                type="submit"
                className={`group relative w-full md:w-60 overflow-hidden border ${PALETTE.BORDER} py-4 transition-all duration-500 hover:border-[#654321] disabled:opacity-50`}
              >
                <div className="absolute inset-0 translate-y-full bg-[#654321] transition-transform duration-500 ease-out group-hover:translate-y-0" />
                <div className="relative flex items-center justify-center gap-4">
                  <span
                    className={`text-[14px] font-bold tracking-[0.4em] transition-colors duration-500 group-hover:text-white ${PALETTE.TEXT}`}
                  >
                    {loading ? "SENDING..." : "SUBMIT_MESSAGE"}
                  </span>
                  <ArrowRight
                    size={16}
                    className={`transition-colors duration-500 group-hover:text-white ${PALETTE.TEXT}`}
                  />
                </div>
              </button>
            </form>
          </div>
        </div>
        {/* RIGHT: MAP (Monochrome) */}
        <div className="lg:w-[45%] relative min-h-[600px] lg:min-h-screen">
          <div className="absolute inset-0 grayscale contrast-[1.2] invert opacity-80">
            <iframe
              src="https://www.google.com/maps?q=india&output=embed"
              className="w-full h-full object-cover border-none"
              loading="lazy"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className={`absolute inset-x-8 bottom-12 p-10 ${PALETTE.LIGHT} backdrop-blur-3xl border ${PALETTE.BORDER} rounded-[3rem] shadow-2xl`}
          >
            <div className="space-y-6">
              <div>
                <span className="text-[10px] tracking-widest text-[#DEB887] font-bold">
                  // HQ_STATION
                </span>
                <h3 className="text-2xl font-bold mt-2">ATELIER_MUMBAI</h3>
                <p className="text-xs text-gray-500 mt-4 leading-relaxed tracking-tighter">
                  PLOT_C-12, G_BLOCK, BKC,
                  <br />
                  BANDRA_EAST, MH_400051
                </p>
              </div>

              <div className={`flex gap-12 pt-6 border-t ${PALETTE.BORDER}/30`}>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-[#DEB887] font-bold">
                    WA_INTL
                  </span>
                  <span className="font-bold">+91.98XXX</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-[#DEB887] font-bold">
                    OFFICE_E
                  </span>
                  <span className="font-bold">CARE@BRAND.COM</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= CONDENSED FAQ ================= */}
      {/* <section
        className={`py-20 px-8 ${PALETTE.BG} border-t border-[#DEB887]/20`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-baseline gap-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tighter underline decoration-[#DEB887] decoration-2 underline-offset-8">
              02/ CORE_FAQ
            </h2>
            <span className="text-[10px] opacity-40 italic">
              --SYSTEM_LOGS_v1.0
            </span>
          </div>

          <div className="divide-y divide-[#DEB887]/20 border-t border-[#DEB887]/20">
            {FAQ_DATA.map((item, idx) => (
              <details key={idx} className="group cursor-pointer">
                <summary className="list-none flex items-center justify-between py-6 transition-colors font-bold tracking-widest">
                  <span className="flex items-center gap-4">
                    <span className="text-[10px] text-[#DEB887]">
                      [{idx + 1}]
                    </span>
                    {item.q}
                  </span>
                  <div className="relative w-4 h-4 text-[#DEB887]">
                    <Plus
                      size={14}
                      className="absolute inset-0 group-open:opacity-0 transition-all duration-300"
                    />
                    <Minus
                      size={14}
                      className="absolute inset-0 opacity-0 group-open:opacity-100 transition-all duration-300"
                    />
                  </div>
                </summary>
                <div className="pb-6 pl-12 text-gray-500 leading-relaxed max-w-2xl lowercase tracking-tighter">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
}
function FloatingMonoInput({
  label,
  type = "text",
  value,
  onChange,
  required = false,
}) {
  return (
    <div className="relative group">
      <input
        type={type}
        required={required}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full bg-transparent border-b border-[#DEB887]/50 py-3 focus:outline-none focus:border-[#654321] transition-all text-[14px] font-mono text-[#654321] placeholder-transparent"
      />
      <label className="absolute left-0 top-3 text-[14px] tracking-[0.2em] text-[#DEB887] pointer-events-none transition-all peer-focus:-top-6 peer-focus:text-[#654321] peer-[:not(:placeholder-shown)]:-top-6 uppercase">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
}
const FAQ_DATA = [
  {
    q: "SHIPPING_PROTOCOL",
    a: "Standard dispatch within 48 hours. Worldwide priority logistics supported.",
  },
  {
    q: "RETURN_WINDOW",
    a: "14-day return frame active. Custom-tailored items are ineligible for return.",
  },
  {
    q: "BESPOKE_TIMELINE",
    a: "Average production cycle is 21 working days from design confirmation.",
  },
  {
    q: "CURRENCY_CONVERSION",
    a: "System automatically calculates taxes and duties at point of checkout.",
  },
];
