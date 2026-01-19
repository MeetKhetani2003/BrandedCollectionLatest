"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* --------------------------------- */
/* -------- CATEGORY DATA ----------- */
/* --------------------------------- */

const CATEGORY_MAP = {
  clothes: {
    Shirts: [
      "Half Sleeve",
      "Full Sleeve",
      "Linen",
      "Embroidered",
      "Designer",
      "Office Wear",
      "Check",
      "Plain",
      "Imported",
      "Denim",
    ],
    "Polo T-Shirts": [],
    "Round Neck T-Shirts": ["Crew Neck", "Drop Shoulder", "Oversized"],
    "Winter Wear": ["Jackets", "Sweaters", "Sweatshirts"],
    Denim: [
      "Ankle Fit",
      'Straight Fit (14")',
      "Comfort Narrow",
      'Regular Fit (16", 18")',
      "Baggy Fit",
    ],
    "Cotton / Chinos": ["Ankle Fit", "Comfort Fit"],
    "Formal Pants": ["Ankle Fit", "Straight Fit", "Comfort Fit"],
    "Track Pants": [
      "Dry Fit Fabric",
      "Cotton Fleece Fabric",
      "Ankle Fit",
      "Straight Fit",
    ],
    "Dry Fit T-Shirts": ["Round Neck", "Collar Free"],
  },

  shoes: {
    Shoes: ["Sports Shoes", "Sneakers"],
    Slippers: ["Flip Flops", "Strap Slippers"],
    Crocs: ["Men", "Women"],
  },

  accessories: {
    "Perfume / Deo": ["Replica", "Indian Made", "Premium Collection"],
    Deodorants: ["Gas Deo", "Water Deo"],
    Watches: ["Analog", "Battery", "Automatic"],
  },
};

const SIZE_MAP = {
  clothes: [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
    "5XL",
    "28",
    "30",
    "32",
    "34",
    "36",
    "38",
    "40",
    "42",
    "44",
    "46",
    "48",
  ],
  shoes: ["6", "7", "8", "9", "10", "11", "12"],
  accessories: ["General"],
};

/* --------------------------------- */
/* -------- TABS -------------------- */
/* --------------------------------- */

const TABS = {
  LIST: "list",
  CREATE: "create",
  EDIT: "edit",
};

/* --------------------------------- */
/* -------- MAIN PAGE --------------- */
/* --------------------------------- */

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState(TABS.LIST);
  const [editProductId, setEditProductId] = useState(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#4a2e1f]">Products</h1>

      <div className="flex gap-3 border-b border-[#ead7c5]">
        <Tab
          active={activeTab === TABS.LIST}
          onClick={() => setActiveTab(TABS.LIST)}
        >
          Product Listing
        </Tab>

        <Tab
          active={activeTab === TABS.CREATE}
          onClick={() => {
            setEditProductId(null);
            setActiveTab(TABS.CREATE);
          }}
        >
          Create Product
        </Tab>

        {activeTab === TABS.EDIT && <Tab active>Edit Product</Tab>}
      </div>

      {activeTab === TABS.LIST && (
        <ProductList
          onEdit={(id) => {
            setEditProductId(id);
            setActiveTab(TABS.EDIT);
          }}
        />
      )}

      {(activeTab === TABS.CREATE || activeTab === TABS.EDIT) && (
        <CreateProduct
          productId={editProductId}
          onSuccess={() => {
            setEditProductId(null);
            setActiveTab(TABS.LIST);
          }}
        />
      )}
    </div>
  );
}

/* --------------------------------- */
/* -------- PRODUCT LIST ------------ */
/* --------------------------------- */

function ProductList({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [loadingId, setLoadingId] = useState(null);

  async function fetchProducts() {
    const res = await fetch("/api/products?page=1&limit=1000000");
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.products || [];
    setProducts(list);
    setFilteredProducts(list);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔍 Search and Filter Logic
  useEffect(() => {
    let result = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // ↕️ Sorting Logic
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle nested price sorting
      if (sortConfig.key === "price") {
        aValue = a.price?.current || 0;
        bValue = b.price?.current || 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProducts(result);
  }, [searchTerm, products, sortConfig]);

  const requestSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  async function handleDelete(productId) {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      setLoadingId(productId);
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* --- Advanced Toolbar --- */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-[#ead7c5]">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name, category, or brand..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4a2e1f] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        <div className="text-sm text-gray-500">
          Showing <b>{filteredProducts.length}</b> products
        </div>
      </div>

      {/* --- Advanced Table --- */}
      <div className="bg-white border border-[#ead7c5] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fdf7f2] text-[#4a2e1f] text-sm uppercase font-semibold">
              <tr>
                <th
                  className="px-4 py-4 cursor-pointer hover:bg-[#f5e6d8]"
                  onClick={() => requestSort("name")}
                >
                  Product{" "}
                  {sortConfig.key === "name"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="px-4 py-4">Category</th>
                <th
                  className="px-4 py-4 cursor-pointer hover:bg-[#f5e6d8]"
                  onClick={() => requestSort("price")}
                >
                  Price{" "}
                  {sortConfig.key === "price"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="px-4 py-4">Stock</th>
                <th
                  className="px-4 py-4 cursor-pointer hover:bg-[#f5e6d8]"
                  onClick={() => requestSort("createdAt")}
                >
                  Added On{" "}
                  {sortConfig.key === "createdAt"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ead7c5]">
              {filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {/* Small Preview Thumbnail */}
                      <img
                        src={p.imageFrontPath || "/placeholder.png"}
                        className="w-10 h-10 rounded object-cover border"
                        alt=""
                      />
                      <div>
                        <div className="font-bold text-gray-800">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-[#ead7c5] text-[#4a2e1f] text-xs rounded-full">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-green-700">
                    ₹{p.price?.current}
                  </td>
                  <td className="px-4 py-4">
                    {p.sizes?.reduce((sum, s) => sum + s.quantity, 0) > 0 ? (
                      <span className="text-gray-700">
                        {p.sizes?.reduce((sum, s) => sum + s.quantity, 0)}
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(p.slug)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                        title="Edit"
                      >
                        📝
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        disabled={loadingId === p._id}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg disabled:opacity-50"
                        title="Delete"
                      >
                        {loadingId === p._id ? "..." : "🗑️"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No products found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- */
/* -------- CREATE / EDIT ----------- */
/* --------------------------------- */

function CreateProduct({ productId, onSuccess }) {
  const isEdit = !!productId;
  const [product, setProduct] = useState(null);
  const [existingImages, setExistingImages] = useState({
    front: [],
    back: [],
    gallery: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mainCategory, setMainCategory] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [sizes, setSizes] = useState([]);

  const [flags, setFlags] = useState({
    isNewArrival: false,
    isBestseller: false,
    featured: false,
  });

  useEffect(() => {
    if (!productId) return;

    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((d) => {
        const p = d.product;

        setProduct(p);
        setMainCategory(p.mainCategory || "");
        setCategory(p.category || "");
        setSubcategory(p.subcategory || "");

        // ✅ FIX: Use imageFrontPath and imageBackPath instead of imageFront
        setExistingImages({
          front: p.imageFrontPath
            ? [{ url: p.imageFrontPath, existing: true }]
            : [],
          back: p.imageBackPath
            ? [{ url: p.imageBackPath, existing: true }]
            : [],
          // If your gallery field in JSON is 'gallery', use that
          gallery: (p.gallery || []).map((path) => ({
            url: path,
            existing: true,
          })),
        });
        const allowedSizes = SIZE_MAP[p.mainCategory] || [];
        setSizes(
          allowedSizes.map((s) => ({
            size: s,
            quantity: p.sizes?.find((x) => x.size === s)?.quantity || 0,
          })),
        );

        setFlags({
          isNewArrival: !!p.isNewArrival,
          isBestseller: !!p.isBestseller,
          featured: !!p.featured,
        });
      });
  }, [productId]);

  console.log(product);

  useEffect(() => {
    if (!mainCategory) {
      setSizes([]);
      return;
    }
    setSizes(SIZE_MAP[mainCategory].map((s) => ({ size: s, quantity: 0 })));
  }, [mainCategory]);

  async function handleSubmit(e) {
    e.preventDefault();

    // 🚫 prevent spam clicks
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const f = e.target;
      const fd = new FormData();

      if (f.imageFront?.files[0])
        fd.append("imageFront", f.imageFront.files[0]);
      if (f.imageBack?.files[0]) fd.append("imageBack", f.imageBack.files[0]);

      if (f.galleryImages?.files?.length) {
        [...f.galleryImages.files].forEach((img) =>
          fd.append("galleryImages", img),
        );
      }

      const productData = {
        name: f.name.value,
        brand: f.brand.value,
        mainCategory,
        category,
        subcategory,
        price: {
          current: Number(f.priceCurrent.value),
          old: Number(f.priceOld.value),
          discountText: f.discountText.value,
        },
        sizes: sizes.filter((s) => s.quantity > 0),
        salesCount: Number(f.salesCount.value),
        description: f.description.value,
        ...flags,
      };

      fd.append("productData", JSON.stringify(productData));
      if (isEdit) fd.append("productId", productId);

      const res = await fetch("/api/products", {
        method: isEdit ? "PUT" : "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to save product");

      toast.success(isEdit ? "Product Updated" : "Product Created");
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-xl p-6 space-y-6"
    >
      <p className="text-xs text-gray-500">
        <span className="text-red-500">*</span> Required fields
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          name="name"
          label={<FieldLabel required>Product Name</FieldLabel>}
          defaultValue={product?.name}
        />
        <Input
          name="brand"
          label={<FieldLabel optional>Brand</FieldLabel>}
          defaultValue={product?.brand}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Select
          label={<FieldLabel required>Main Category</FieldLabel>}
          value={mainCategory}
          onChange={(e) => setMainCategory(e.target.value)}
        >
          <option value="">Select</option>
          <option value="clothes">Clothes</option>
          <option value="shoes">Shoes</option>
          <option value="accessories">Accessories</option>
        </Select>

        <Select
          label={<FieldLabel required>Category</FieldLabel>}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select</option>
          {mainCategory &&
            Object.keys(CATEGORY_MAP[mainCategory]).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </Select>

        <Select
          label={<FieldLabel optional>Sub Category</FieldLabel>}
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
        >
          <option value="">Optional</option>
          {mainCategory &&
            category &&
            CATEGORY_MAP[mainCategory][category]?.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
        </Select>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Input
          name="priceCurrent"
          label={<FieldLabel required>Current Price</FieldLabel>}
          type="number"
          defaultValue={product?.price?.current}
        />
        <Input
          name="priceOld"
          label={<FieldLabel optional>Old Price</FieldLabel>}
          type="number"
          defaultValue={product?.price?.old}
        />
        <Input
          name="discountText"
          label={<FieldLabel optional>Discount Text</FieldLabel>}
          defaultValue={product?.price?.discountText}
        />
      </div>

      {sizes.length > 0 && (
        <div>
          <label className="text-sm font-medium block mb-2">
            <FieldLabel required>Size Wise Stock</FieldLabel>
          </label>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {sizes.map((s) => (
              <div key={s.size} className="flex items-center gap-2">
                <span className="w-8 text-sm">{s.size}</span>
                <input
                  type="number"
                  min="0"
                  value={s.quantity}
                  onChange={(e) =>
                    setSizes((prev) =>
                      prev.map((x) =>
                        x.size === s.size
                          ? { ...x, quantity: Number(e.target.value) }
                          : x,
                      ),
                    )
                  }
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Input
        name="salesCount"
        label={<FieldLabel optional>Sales Count</FieldLabel>}
        type="number"
        defaultValue={product?.salesCount}
      />

      <Textarea
        name="description"
        label={<FieldLabel optional>Description</FieldLabel>}
        defaultValue={product?.description}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <FileInput
          name="imageFront"
          label={<FieldLabel required>Front Image</FieldLabel>}
          initialImages={existingImages.front}
        />

        <FileInput
          name="imageBack"
          label={<FieldLabel optional>Back Image</FieldLabel>}
          initialImages={existingImages.back}
        />
      </div>

      <FileInput
        name="galleryImages"
        label={<FieldLabel optional>Gallery Images</FieldLabel>}
        multiple
        initialImages={existingImages.gallery}
      />

      <div className="flex gap-6 text-sm">
        <Checkbox
          label="New Arrival"
          checked={flags.isNewArrival}
          onChange={(e) =>
            setFlags({ ...flags, isNewArrival: e.target.checked })
          }
        />
        <Checkbox
          label="Best Seller"
          checked={flags.isBestseller}
          onChange={(e) =>
            setFlags({ ...flags, isBestseller: e.target.checked })
          }
        />
        <Checkbox
          label="Featured"
          checked={flags.featured}
          onChange={(e) => setFlags({ ...flags, featured: e.target.checked })}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-6 py-2 rounded text-white transition ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#4a2e1f] hover:opacity-90"
        }`}
      >
        {isSubmitting
          ? isEdit
            ? "Updating..."
            : "Creating..."
          : isEdit
            ? "Update Product"
            : "Create Product"}
      </button>
    </form>
  );
}

/* --------------------------------- */
/* -------- UI HELPERS -------------- */
/* --------------------------------- */

function FieldLabel({ children, required = false, optional = false }) {
  return (
    <span className="flex items-center gap-1">
      {children}
      {required && <span className="text-red-500">*</span>}
      {optional && <span className="text-xs text-gray-400">(Optional)</span>}
    </span>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <input {...props} className="w-full border px-3 py-2 rounded" />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <textarea
        {...props}
        rows={4}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="text-sm">{label}</label>
      <select {...props} className="w-full border px-3 py-2 rounded">
        {children}
      </select>
    </div>
  );
}

function FileInput({
  label,
  name,
  multiple = false,
  initialImages = [], // 👈 NEW
}) {
  const [previews, setPreviews] = useState([]);

  // 🔹 Load existing images (edit mode)
  useEffect(() => {
    if (initialImages.length) {
      setPreviews(
        initialImages.map((img) => ({
          url: img.url,
          existing: true, // mark as existing image
        })),
      );
    }
  }, [initialImages]);

  function handleChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImgs = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      existing: false,
    }));

    setPreviews((prev) => (multiple ? [...prev, ...newImgs] : newImgs));
  }

  function removeImage(index) {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <div className="relative border-2 border-dashed border-[#ead7c5] rounded-lg p-4 text-center hover:bg-[#fdf7f2] transition">
        <input
          type="file"
          name={name}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <p className="text-sm text-gray-500">
          Click to upload {multiple ? "images" : "image"}
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((img, i) => (
            <div
              key={i}
              className="relative group border rounded overflow-hidden"
            >
              <img
                src={img.url}
                alt="preview"
                className="h-28 w-full object-cover"
              />

              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>

              {img.existing && (
                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                  Existing
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Checkbox({ label, ...props }) {
  return (
    <label className="flex gap-2 items-center">
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}

function Tab({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-t ${
        active ? "bg-[#4a2e1f] text-white" : ""
      }`}
    >
      {children}
    </button>
  );
}
