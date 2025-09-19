import { useState, useEffect } from "react";
import Products from "../components/products";
import "./Home.css";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const categories = ["All", "Mobiles", "Laptops", "Accessories", "Footwear", "Electronics"];

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to ShopZone</h1>

      {/* Category Filter Buttons */}
      <div className="category-filters" style={{ marginBottom: 20 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat === "All" ? "" : cat)}
            className={`category-btn ${
              selectedCategory === cat || (selectedCategory === "" && cat === "All") ? "active" : ""
            }`}
            style={{
              marginRight: 10,
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid #00796b",
              background:
                selectedCategory === cat || (selectedCategory === "" && cat === "All") ? "#00796b" : "transparent",
              color:
                selectedCategory === cat || (selectedCategory === "" && cat === "All") ? "#fff" : "#00796b",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="search-bar" style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: "#00796b",
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        <Products searchTerm={debouncedSearch} category={selectedCategory} />
      </div>
    </div>
  );
}

export default Home;
