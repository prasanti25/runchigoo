import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto("http://127.0.0.1:5173", { waitUntil: "networkidle" });
async function loadImages() {
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await Promise.all([...document.images].map((image) => image.decode().catch(() => {})));
  });
}
await loadImages();
await page.screenshot({
  path: "/private/tmp/ruchigo-product-desktop.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await loadImages();
await page.screenshot({
  path: "/private/tmp/ruchigo-product-mobile.png",
  fullPage: true,
});
const overflow = await page.evaluate(() => ({
  viewport: innerWidth,
  document: document.documentElement.scrollWidth,
}));
console.log(JSON.stringify({ errors, overflow, title: await page.title() }));
await browser.close();
