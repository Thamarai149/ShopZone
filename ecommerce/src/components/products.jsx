import React from "react";
import { useCart } from "../context/CartContext.jsx";

import iphone from "../assets/iphone15.jpg";
import galaxy from "../assets/galaxyS23.jpg";
import sony from "../assets/sonyHeadphones.jpg";
import dell from "../assets/dellLaptop.jpg";
import nike from "../assets/nikeSneakers.jpg";

import macbook from "../assets/macbookPro.jpg";
import bose from "../assets/boseHeadphones.jpg";
import adidas from "../assets/adidasShoes.jpg";
import samsungTV from "../assets/samsungTV.jpg";
import canon from "../assets/canonCamera.jpg";

import "./products.css";

function Products({ searchTerm = "", category = "" }) {
  const { addToCart } = useCart();

  const products = [
    { _id: 1, name: "Apple iPhone 15", price: 100000, image: iphone, category: "Mobiles", discount: "10% OFF" },
    { _id: 2, name: "Samsung Galaxy S23", price: 100000, image: galaxy, category: "Mobiles" },
    { _id: 3, name: "Sony Headphones", price: 4999, image: sony, category: "Accessories" },
    { _id: 4, name: "Dell Laptop", price: 75000, image: dell, category: "Laptops" },
    { _id: 5, name: "Nike Sneakers", price: 7000, image: nike, category: "Footwear" },
    { _id: 6, name: "MacBook Pro", price: 150000, image: macbook, category: "Laptops" },
    { _id: 7, name: "Bose Headphones", price: 12000, image: bose, category: "Accessories" },
    { _id: 8, name: "Adidas Running Shoes", price: 6500, image: adidas, category: "Footwear" },
    { _id: 9, name: "Samsung 4K TV", price: 80000, image: samsungTV, category: "Electronics", discount: "5% OFF" },
    { _id: 10, name: "Canon DSLR Camera", price: 55000, image: canon, category: "Electronics" },
  ];

  // Filter by category (if set)
  const filteredByCategory = category ? products.filter((p) => p.category === category) : products;

  // Filter by search term
  const filteredProducts = filteredByCategory.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    return <p className="text-center text-gray-600">No products found.</p>;
  }

  return (
    <>
      {filteredProducts.map((product) => (
        <div key={product._id} className="product-card">
          {product.discount && <span className="discount-badge">{product.discount}</span>}
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <p>₹{product.price.toLocaleString()}</p>
          <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
            Add to Cart
          </button>
        </div>
      ))}
    </>
  );
}

export default Products;
