import { useCart } from "../context/CartContext.jsx";
import { Link } from "react-router-dom";
import "./cart.css";

function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <h1>Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div>
                <h2>{item.name}</h2>
                <p>₹{item.price.toLocaleString()}</p>
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={(e) => {
                    const qty = Math.max(1, parseInt(e.target.value, 10));
                    updateQuantity(item._id, qty);
                  }}
                />
                <button onClick={() => removeFromCart(item._id)}>Remove</button>
              </div>
            </div>
          ))}

          <h2>Total: ₹{total.toLocaleString()}</h2>

          <Link to="/checkout">
            <button>Proceed to Checkout</button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Cart;
