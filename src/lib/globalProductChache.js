let cache = {
  products: [],
  lastSync: null,
  dirty: true,
};

export const getCache = () => cache;

export const setCache = (data) => {
  cache.products = data;
  cache.lastSync = Date.now();
  cache.dirty = false;
};

export const updateCacheItem = (item) => {
  const i = cache.products.findIndex((p) => p._id === item._id);
  if (i > -1) cache.products[i] = item;
  else cache.products.push(item);
};

export const removeCacheItem = (id) => {
  cache.products = cache.products.filter(
    (p) => p._id.toString() !== id.toString()
  );
};

export const clearCache = () => {
  cache.products = [];
  cache.lastSync = null;
};
