"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Search,
  Loader2,
  MessageSquare,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterReason, setFilterReason] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = Newest, 'asc' = Oldest

  useEffect(() => {
    async function fetchInquiries() {
      try {
        const response = await fetch("/api/contact");
        const result = await response.json();
        if (result.success) setInquiries(result.data);
      } catch (error) {
        toast.error("Failed to load inquiries");
      } finally {
        setLoading(false);
      }
    }
    fetchInquiries();
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let data = [...inquiries];

    // 1. Filter by Reason
    if (filterReason !== "all") {
      data = data.filter((item) => item.reason === filterReason);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 3. Sort by Date
    return data.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [inquiries, filterReason, searchTerm, sortOrder]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Customer Inquiries</h1>

        <div className="flex flex-wrap gap-2">
          {/* Date Sort Toggle Button */}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="flex items-center gap-2 px-4 py-2 text-xs rounded-full border bg-white hover:bg-gray-100 transition font-medium text-gray-700"
          >
            <ArrowUpDown size={14} />
            {sortOrder === "desc" ? "NEWEST FIRST" : "OLDEST FIRST"}
          </button>

          <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block" />

          {["all", "product", "complaint", "other"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterReason(r)}
              className={`px-4 py-2 text-xs rounded-full border transition uppercase font-medium
                ${filterReason === r ? "bg-[#4a2e1f] text-white" : "bg-white hover:bg-gray-100"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- SEARCH & LISTING (Table same as before) ---------- */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b bg-gray-50/50">
          <span className="font-semibold text-sm">Recent Messages</span>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#4a2e1f]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium">Contact</th>
                <th className="text-left p-4 font-medium">Reason</th>
                <th className="text-left p-4 font-medium">Message</th>
                <th className="text-left p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAndSortedData.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 align-top font-semibold">{item.name}</td>
                  <td className="p-4 align-top">
                    <div className="text-gray-600">{item.email}</div>
                    <div className="text-xs text-gray-400">{item.phone}</div>
                  </td>
                  <td className="p-4 align-top uppercase text-[10px] font-bold">
                    <span className="px-2 py-0.5 border rounded bg-gray-50">
                      {item.reason}
                    </span>
                  </td>
                  <td className="p-4 align-top text-gray-500 max-w-xs truncate">
                    {item.message}
                  </td>
                  <td className="p-4 align-top text-gray-400 italic">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
