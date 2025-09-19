import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";

function Navbar() {
  const { cartItems } = useCart();

  return (
    <nav className="navbar">
      <h1>ShopZone</h1>
      <div>
        <Link to="/">Home</Link>
        <Link to="/cart" className="cart-link">
          <ShoppingCart size={20} /> ({cartItems.length})
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
