import originalLogo from "../../assets/images/ruchigo-logo.jpeg";

// Preserve the supplied RuchiGo artwork, including its name and tagline.
export default function BrandLogo() {
  return (
    <img
      className="brand-logo"
      src={originalLogo}
      alt="RuchiGo — Fast Food, Fast Delivery"
      width={1254}
      height={1254}
      decoding="async"
    />
  );
}
