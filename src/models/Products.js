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
  { _id: false },
);

/** ---------- SPECIFICATIONS ---------- */
const SpecificationSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

/** ---------- GALLERY ---------- */
const GalleryImageSchema = new Schema(
  {
    path: { type: String, required: true },
  },
  { _id: false },
);

/** ---------- SIZE + STOCK ---------- */
const SizeStockSchema = new Schema(
  {
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { _id: false },
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
  },
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
/** ---------- PRE-SAVE HOOK ---------- */
ProductSchema.pre("save", async function () {
  // Use 'this' directly
  if (this.mainCategory === "accessories" && this.sizes) {
    this.sizes = this.sizes.filter(
      (s) => s.size === "General" || s.size === "one-size",
    );
  }

  // Slug logic
  if (this.isNew || this.isModified("name")) {
    if (!this.name) throw new Error("Product name is required");

    const baseSlug = slugify(this.name.trim(), {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    // Use the model name strictly as defined
    const ProductModel =
      mongoose.models.Product || mongoose.model("Product", ProductSchema);

    while (await ProductModel.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }
  // NOTE: In async hooks, you don't need to call next()
});

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
