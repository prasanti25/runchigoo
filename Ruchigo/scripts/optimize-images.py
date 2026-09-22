"""Create small local WebP assets from the preview's existing stock photos."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
source = root / "public" / "demo-food"
destination = root / "public" / "food"
destination.mkdir(exist_ok=True)
for name in ("protein-bowl", "fresh-salad", "berry-cake", "grill-platter", "pizza", "burger", "curry", "rice", "biryani", "iced-coffee", "veg-thali"):
    path = source / f"{name}.jpg"
    if not path.exists():
        continue
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image.thumbnail((720, 720))
        target = destination / f"{name}.webp"
        image.save(target, "WEBP", quality=78, method=6)
        print(f"{name}: {path.stat().st_size // 1024} KB -> {target.stat().st_size // 1024} KB")

# Small square crops for the category rail. Crop positions keep the food in
# focus, while preserving the original source photographs unchanged.
categories = {
    "north-indian": ("curry", (0.5, 0.8)),
    "biryani": ("biryani", (0.5, 0.6)),
    "pizza": ("pizza", (0.72, 0.5)),
    "burgers": ("burger", (0.5, 0.5)),
    "healthy": ("fresh-salad", (0.5, 0.5)),
    "desserts": ("berry-cake", (0.5, 0.5)),
    "drinks": ("iced-coffee", (0.15, 0.5)),
}
category_destination = root / "public" / "categories"
category_destination.mkdir(exist_ok=True)
for category, (photo, center) in categories.items():
    with Image.open(source / f"{photo}.jpg") as original:
        image = ImageOps.exif_transpose(original).convert("RGB")
        image = ImageOps.fit(image, (320, 320), method=Image.Resampling.LANCZOS, centering=center)
        target = category_destination / f"{category}.webp"
        image.save(target, "WEBP", quality=82, method=6)
        print(f"category/{category}: {target.stat().st_size // 1024} KB")
