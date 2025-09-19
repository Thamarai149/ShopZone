import React, { useState } from "react";
import "./paymentmodal.css";

const upiApps = [
  { name: "Google Pay", upiId: "sarothamaraiselvan-1@oksbi", icon: "/assets/gpay.png" },
  { name: "PhonePe", upiId: "yourbusiness@upi", icon: "/assets/phonepe.png" },
  { name: "Paytm", upiId: "yourbusiness@upi", icon: "/assets/paytm.png" },
];

const BACKEND_URL = "http://localhost:5000"; // full backend URL

const PaymentModal = ({ products, bookingData, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);

  const totalAmount = products
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  const handleUPIPayment = (upiId) => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${bookingData.name || "Customer"}&tn=ShopZone Order&am=${totalAmount}&cu=INR`;
    window.open(upiUrl, "_blank");

    const orderData = {
      products,
      bookingData,
      totalAmount,
      paymentMethod: "upi",
      upiId,
      orderDate: new Date().toISOString(),
    };

    fetch(`${BACKEND_URL}/api/place-upi-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          alert(`UPI Payment initiated via ${upiId}. Complete payment in your app.`);
          onPaymentSuccess({ upi: true, orderDetails: result.orderDetails });
        } else {
          alert("Failed to record UPI order. Please try again.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Error processing UPI order. Please try again.");
      });
  };

  const handleCOD = () => {
    setProcessing(true);
    const orderData = {
      products,
      bookingData,
      totalAmount,
      paymentMethod: "cod",
      orderDate: new Date().toISOString(),
    };

    fetch(`${BACKEND_URL}/api/place-cod-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          alert("Order placed with Cash on Delivery ✅");
          onPaymentSuccess({ cod: true, orderDetails: result.orderDetails });
        } else {
          alert("Failed to place COD order. Please try again.");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to place COD order. Please try again.");
      })
      .finally(() => setProcessing(false));
  };

  if (!products || products.length === 0 || !bookingData) {
    return (
      <div className="payment-modal-overlay">
        <div className="payment-modal">
          <div className="payment-header">
            <h2>Error</h2>
            <button onClick={onClose}>✖</button>
          </div>
          <div className="error-message">
            <p>Invalid order data. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <h2>Complete Payment</h2>
          <button onClick={onClose} className="close-btn">✖</button>
        </div>

        {/* Customer Info */}
        <div className="customer-details">
          <h3>Customer Information</h3>
          <div className="details-grid">
            <div><strong>Name:</strong> {bookingData.name || "N/A"}</div>
            <div><strong>Email:</strong> {bookingData.email || "N/A"}</div>
            <div><strong>Phone:</strong> {bookingData.phone || "N/A"}</div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="booking-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {products.map((item) => (
              <div key={item.id} className="summary-item">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => (e.target.src = "/placeholder-image.png")}
                />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>₹{item.price.toLocaleString()} x {item.quantity}</p>
                </div>
                <span className="item-total">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="summary-footer">
            <div className="summary-row"><span>Total:</span><span>₹{totalAmount}</span></div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-options">
          <h3>Payment Method</h3>
          <div className="payment-methods">
            <label className="payment-option">
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="checkmark"></span>
              <strong>Pay via UPI</strong>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="checkmark"></span>
              <strong>Cash on Delivery</strong>
            </label>
          </div>

          {/* UPI Buttons */}
          {paymentMethod === "upi" && (
            <div className="upi-apps">
              {upiApps.map((app) => (
                <button
                  key={app.name}
                  className="upi-btn"
                  onClick={() => handleUPIPayment(app.upiId)}
                  disabled={processing}
                >
                  <img src={app.icon} alt={app.name} />
                  Pay with {app.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="payment-actions">
          {paymentMethod === "cod" && (
            <button className="pay-btn cod" onClick={handleCOD} disabled={processing}>
              {processing ? "Placing Order..." : "Place COD Order"}
            </button>
          )}
          <button className="cancel-btn" onClick={onClose} disabled={processing}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
