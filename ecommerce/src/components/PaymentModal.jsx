import React, { useState } from "react";
import "./paymentmodal.css";

const BACKEND_URL = "http://localhost:5000"; // backend base URL

const PaymentModal = ({ products, bookingData, onClose, onPaymentSuccess }) => {
  const [processing, setProcessing] = useState(false);

  const totalAmount = products
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
    .toFixed(2);

  // ✅ Razorpay Payment
  const handleRazorpayPayment = async () => {
    try {
      setProcessing(true);

      // 1. Create Razorpay Order on backend
      const orderData = {
        amount: totalAmount * 100, // convert to paise
        currency: "INR",
        products,
        bookingData,
      };

      const res = await fetch(`${BACKEND_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const { orderId, key } = await res.json();

      if (!orderId) {
        alert("Failed to create Razorpay order.");
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key, // from backend
        amount: totalAmount * 100,
        currency: "INR",
        name: "ShopZone",
        description: "Order Payment",
        order_id: orderId,
        handler: async function (response) {
          // ✅ After successful payment, verify on backend
          const verifyRes = await fetch(`${BACKEND_URL}/api/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              products,
              bookingData,
            }),
          });

          const result = await verifyRes.json();
          if (result.success) {
            alert("Payment Successful ✅");
            onPaymentSuccess({ razorpay: true, orderDetails: result.orderDetails });
          } else {
            alert("Payment verification failed ❌");
          }
        },
        prefill: {
          name: bookingData.name || "Customer",
          email: bookingData.email || "",
          contact: bookingData.phone || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();

    } catch (err) {
      console.error(err);
      alert("Error processing Razorpay payment.");
    } finally {
      setProcessing(false);
    }
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

        {/* Razorpay Button */}
        <div className="payment-actions">
          <button
            className="pay-btn razorpay"
            onClick={handleRazorpayPayment}
            disabled={processing}
          >
            {processing ? "Processing..." : "Pay with Razorpay"}
          </button>
          <button className="cancel-btn" onClick={onClose} disabled={processing}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
