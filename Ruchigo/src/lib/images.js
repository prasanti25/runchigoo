const FOOD_FALLBACKS = [
  "/food/grill-platter.webp",
  "/food/protein-bowl.webp",
  "/food/fresh-salad.webp",
  "/food/berry-cake.webp",
  "/food/pizza.webp",
  "/food/burger.webp",
  "/food/curry.webp",
  "/food/rice.webp",
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
  if (seed && typeof seed === "object") {
    const matches = [
      [/\b(cold|iced)\s+coffee\b|\biced\s+latte\b/, "iced-coffee"],
      [/pizza|margherita/, "pizza"],
      [/burger/, "burger"],
      [/biryani/, "biryani"],
      [/thali/, "veg-thali"],
      [/\brice\b|pulao/, "rice"],
      [/berry.*cake/, "berry-cake"],
      [/salad/, "fresh-salad"],
      [/protein.*bowl/, "protein-bowl"],
      [/curry|paneer.*masala/, "curry"],
      [/grill.*platter|kebab/, "grill-platter"],
    ];
    // Match the dish itself, never a restaurant/category or incidental
    // ingredient in its description. Unknown food must not get a random meal.
    const match = matches.find(([pattern]) =>
      pattern.test(String(seed.name || "").toLowerCase()),
    );
    if (match) return `/food/${match[1]}.webp`;
  }
  return "/food/photo-unavailable.svg";
}

export function categoryPhoto(name) {
  const match = [
    [/pizza|italian/i, "pizza"],
    [/burger/i, "burgers"],
    [/biryani|pulao|rice/i, "biryani"],
    [/indian|thali|curry|meal/i, "north-indian"],
    [/salad|healthy/i, "healthy"],
    [/dessert|sweet|cake/i, "desserts"],
    [/drink|beverage|coffee|tea/i, "drinks"],
  ].find(([pattern]) => pattern.test(name));
  return match ? `/categories/${match[1]}.webp` : getFoodFallback({ name });
}

export function optimizedFoodSource(item) {
  const src = item.image_url || item.image;
  // Known bundled preview photos have an optimized local counterpart.
  const name =
    typeof src === "string"
      ? src.match(/\/demo-food\/([^/]+)\.jpg$/)?.[1]
      : null;
  return name &&
    [
      "protein-bowl",
      "fresh-salad",
      "berry-cake",
      "grill-platter",
      "pizza",
      "burger",
      "curry",
      "rice",
      "biryani",
      "iced-coffee",
      "veg-thali",
    ].includes(name)
    ? `/food/${name}.webp`
    : src;
}

export function getRestaurantFallback(seed) {
  if (seed && typeof seed === "object") {
    const text = `${seed.name || ""} ${seed.description || ""}`.toLowerCase();
    if (/pizza|italian/.test(text)) return "/food/pizza.webp";
    if (/grill|burger/.test(text)) return "/food/grill-platter.webp";
    if (/curry|curries|indian|thali|spice/.test(text))
      return "/food/veg-thali.webp";
    if (/salad|bowl|cafe/.test(text)) return "/food/fresh-salad.webp";
  }
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
