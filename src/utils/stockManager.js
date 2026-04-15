import Product from "@/models/Products";

/**
 * Decrements stock quantities for products in an order.
 * Called after successful order placement.
 * 
 * @param {Array} items - Array of order items with product, qty, and size
 * @returns {Promise<void>}
 */
export async function decrementProductStock(items) {
  try {
    for (const item of items) {
      const productId = item.product || item.productId;
      const orderedQty = item.qty || 1;
      const orderedSize = item.size || "Free Size";

      if (!productId) continue;

      // Find the product and update the specific size quantity
      const product = await Product.findById(productId);
      
      if (!product) {
        console.warn(`Product not found: ${productId}`);
        continue;
      }

      // Find the size entry that matches the ordered size
      const sizeEntry = product.sizes?.find(
        (s) => s.size === orderedSize
      );

      if (!sizeEntry) {
        console.warn(`Size ${orderedSize} not found for product ${productId}`);
        continue;
      }

      // Decrement the quantity (don't go below 0)
      const newQuantity = Math.max(0, sizeEntry.quantity - orderedQty);
      sizeEntry.quantity = newQuantity;

      // Update the salesCount for tracking
      product.salesCount = (product.salesCount || 0) + orderedQty;

      await product.save();
      
      console.log(
        `Stock updated: Product ${productId}, Size ${orderedSize}, ` +
        `New quantity: ${newQuantity}`
      );
    }
  } catch (error) {
    console.error("Error decrementing product stock:", error);
    throw error;
  }
}

/**
 * Checks if a product has any stock available
 * 
 * @param {String} productId - Product ID
 * @returns {Promise<Boolean>} - True if product has stock
 */
export async function isProductInStock(productId) {
  try {
    const product = await Product.findById(productId);
    
    if (!product) return false;
    
    const totalStock = product.sizes?.reduce(
      (sum, size) => sum + (size.quantity || 0), 
      0
    ) || 0;
    
    return totalStock > 0;
  } catch (error) {
    console.error("Error checking product stock:", error);
    return false;
  }
}

/**
 * Calculates total stock for a product
 * 
 * @param {String} productId - Product ID
 * @returns {Promise<Number>} - Total stock quantity
 */
export async function getProductStock(productId) {
  try {
    const product = await Product.findById(productId);
    
    if (!product) return 0;
    
    return product.sizes?.reduce(
      (sum, size) => sum + (size.quantity || 0), 
      0
    ) || 0;
  } catch (error) {
    console.error("Error getting product stock:", error);
    return 0;
  }
}
