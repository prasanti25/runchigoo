import Navbar from "../Navbar.jsx";

export default function InfoLayout({ eyebrow, title, description, children }) {
  return (
    <>
      <Navbar />
      <main className="info-page">
        <div className="container">
          <header className="info-heading">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </header>
          {children}
        </div>
      </main>
    </>
  );
}
