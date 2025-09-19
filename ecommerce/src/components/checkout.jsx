import React, { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import PaymentModal from "./PaymentModal";
import "./checkout.css";

function Checkout() {
  const { cartItems, clearCart } = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});

  // Calculate total amount
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Validate customer form
  const validateForm = () => {
    const newErrors = {};
    if (!customerData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!customerData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!customerData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(customerData.phone)) {
      newErrors.phone = "Enter valid 10-digit phone number";
    }
    if (!customerData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!customerData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!customerData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(customerData.pincode)) {
      newErrors.pincode = "Enter valid 6-digit pincode";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCustomerFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowCustomerForm(false);
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = (response) => {
    if (response.cod) {
      alert(
        `COD Order Placed Successfully! 🎉\nTotal: ₹${total.toLocaleString()}\nOrder will be delivered soon!`
      );
    } else if (response.razorpay_payment_id) {
      alert(
        `Payment Successful! 🎉\nPayment ID: ${response.razorpay_payment_id}\nTotal: ₹${total.toLocaleString()}`
      );
    }
    clearCart();
    setShowPayment(false);
    setShowCustomerForm(false);
    setCustomerData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
    });
  };

  const handleProceedToPayment = () => {
    if (!customerData.name || !customerData.email || !customerData.phone) {
      setShowCustomerForm(true);
    } else {
      setShowPayment(true);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h1 className="empty-cart-title">Your cart is empty</h1>
          <p className="empty-cart-message">Add items to your cart to proceed with checkout.</p>
          <button className="continue-shopping-btn" onClick={() => (window.location.href = "/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <h1 className="checkout-title">Checkout</h1>

        {/* Order Summary */}
        <div className="order-summary">
          <h2 className="section-title">Order Summary</h2>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-info">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="item-image"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-price-qty">
                      ₹{item.price.toLocaleString()} × {item.quantity}
                    </p>
                    {item.size && <p className="item-size">Size: {item.size}</p>}
                    {item.color && <p className="item-color">Color: {item.color}</p>}
                  </div>
                </div>
                <div className="item-total">₹{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className="price-row">
              <span>Shipping:</span>
              <span className="free-shipping">FREE</span>
            </div>
            <div className="price-row">
              <span>Tax:</span>
              <span>₹0</span>
            </div>
            <div className="total-row">
              <span>Total:</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Customer Information (if available) */}
        {customerData.name && (
          <div className="customer-info-preview">
            <h2 className="section-title">Delivery Information</h2>
            <div className="customer-details">
              <p>
                <strong>Name:</strong> {customerData.name}
              </p>
              <p>
                <strong>Email:</strong> {customerData.email}
              </p>
              <p>
                <strong>Phone:</strong> {customerData.phone}
              </p>
              <p>
                <strong>Address:</strong> {customerData.address}, {customerData.city} - {customerData.pincode}
              </p>
            </div>
            <button className="edit-info-btn" onClick={() => setShowCustomerForm(true)}>
              Edit Information
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="checkout-actions">
          <button onClick={handleProceedToPayment} className="proceed-btn">
            {customerData.name ? "Proceed to Payment" : "Enter Details & Pay"}
          </button>
          <button onClick={() => window.history.back()} className="back-btn">
            ← Continue Shopping
          </button>
        </div>
      </div>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="modal-overlay">
          <div className="customer-form-modal">
            <div className="modal-header">
              <h2>Enter Delivery Details</h2>
              <button onClick={() => setShowCustomerForm(false)} className="close-btn">
                ✖
              </button>
            </div>
            <form onSubmit={handleCustomerFormSubmit} className="customer-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "error" : ""}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? "error" : ""}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "error" : ""}
                  placeholder="your@email.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="address">Address *</label>
                <textarea
                  id="address"
                  name="address"
                  value={customerData.address}
                  onChange={handleInputChange}
                  className={errors.address ? "error" : ""}
                  placeholder="House/Flat No., Street, Area"
                  rows="3"
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={customerData.city}
                    onChange={handleInputChange}
                    className={errors.city ? "error" : ""}
                    placeholder="City name"
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={customerData.pincode}
                    onChange={handleInputChange}
                    className={errors.pincode ? "error" : ""}
                    placeholder="6-digit pincode"
                    maxLength="6"
                  />
                  {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Save & Continue
                </button>
                <button type="button" onClick={() => setShowCustomerForm(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          products={cartItems}
          bookingData={{
            ...customerData,
            date: new Date().toISOString(),
          }}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default Checkout;
