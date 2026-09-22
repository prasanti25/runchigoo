import Navbar from "../components/Navbar.jsx";
import Recommendations from "../components/product/Recommendations.jsx";

export default function ForYou() {
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <div className="page-heading">
            <p className="eyebrow">FOR YOUR TASTE, YOUR BUDGET</p>
            <h1>What are you craving?</h1>
            <p className="muted">
              Tell us what sounds good. Explore matching dishes, then open the
              restaurant’s menu to make your meal.
            </p>
          </div>
          <Recommendations />
        </div>
      </main>
    </>
  );
}
