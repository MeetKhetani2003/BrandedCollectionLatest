import mongoose from "mongoose";
import slugify from "slugify";

const { Schema } = mongoose;

/** ---------- PRICE ---------- */
const PriceSchema = new Schema(
  {
    current: { type: Number, required: true },
    old: Number,
    discountText: String,
  },
  { _id: false }
);

/** ---------- SPECIFICATIONS ---------- */
const SpecificationSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

/** ---------- GALLERY ---------- */
const GalleryImageSchema = new Schema(
  {
    path: { type: String, required: true },
  },
  { _id: false }
);

/** ---------- SIZE + STOCK ---------- */
const SizeStockSchema = new Schema(
  {
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/** ---------- PRODUCT ---------- */
const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },

    brand: { type: String, default: "Branded Collection" },
    category: { type: String, required: true },
    subcategory: String,

    price: { type: PriceSchema, required: true },

    imageFrontPath: { type: String, required: true },
    imageBackPath: String,

    description: String,
    specifications: [SpecificationSchema],
    material: String,
    careInstructions: String,

    gallery: [GalleryImageSchema],

    tags: [String],

    sizes: { type: [SizeStockSchema], default: [] },

    mainCategory: {
      type: String,
      enum: ["clothes", "shoes", "accessories"],
      default: "clothes",
      required: true,
    },

    isNewArrival: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },

    salesCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/** ---------- VIRTUALS ---------- */
ProductSchema.virtual("imageFront").get(function () {
  return this.imageFrontPath;
});

ProductSchema.virtual("imageBack").get(function () {
  return this.imageBackPath;
});

ProductSchema.virtual("galleryUrls").get(function () {
  return this.gallery?.map((g) => ({ url: g.path })) || [];
});

/** ---------- SLUG ---------- */
ProductSchema.pre("save", async function () {
  if (!this.isModified("name")) return;

  if (this.mainCategory === "accessories") {
    this.sizes = [];
  }

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let i = 1;

  while (await mongoose.models.Product.findOne({ slug })) {
    slug = `${baseSlug}-${i++}`;
  }

  this.slug = slug;
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
