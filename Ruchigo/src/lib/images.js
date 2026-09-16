const FOOD_FALLBACKS = [
  "/demo-food/grill-platter.jpg",
  "/demo-food/protein-bowl.jpg",
  "/demo-food/fresh-salad.jpg",
  "/demo-food/berry-cake.jpg",
  "/demo-food/dish-five.jpg",
  "/demo-food/dish-six.jpg",
  "/demo-food/dish-seven.jpg",
  "/demo-food/dish-eight.jpg",
];

function stableIndex(seed, offset = 0) {
  const value = String(seed ?? "ruchigo");
  let hash = offset;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) % FOOD_FALLBACKS.length;
}

function usableUrl(image) {
  return typeof image === "string" && image.trim() ? image.trim() : null;
}

export function getFoodFallback(seed) {
  return FOOD_FALLBACKS[stableIndex(seed)];
}

export function getRestaurantFallback(seed) {
  return FOOD_FALLBACKS[stableIndex(seed, 3)];
}

export function resolveFoodImage(image, seed) {
  return usableUrl(image) || getFoodFallback(seed);
}

export function resolveRestaurantImage(image, seed) {
  return usableUrl(image) || getRestaurantFallback(seed);
}

export function applyImageFallback(event, fallbackUrl) {
  const image = event.currentTarget;
  image.onerror = null;
  image.src = fallbackUrl;
}
