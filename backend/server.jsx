import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fs from "fs";
import * as XLSX from "xlsx";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to save order to Excel
function saveOrderToExcel(orderDetails) {
  const filePath = "./orders.xlsx";

  let data = [];

  // If file exists, read old data
  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  }

  // Add new order
  data.push(orderDetails);

  // Convert to sheet & write
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  XLSX.writeFile(workbook, filePath);
}

// ✅ Create Order API
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: amount, // in paise
      currency: currency || "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
});

// ✅ Verify Payment API
app.post("/api/verify-payment", (req, res) => {
  try {
    const { orderId, paymentId, signature, products, bookingData } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, message: "Invalid payment data" });
    }

    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === signature) {
      // ✅ Payment verified
      const orderDetails = {
        orderId,
        paymentId,
        name: bookingData?.name || "N/A",
        email: bookingData?.email || "N/A",
        phone: bookingData?.phone || "N/A",
        products: JSON.stringify(products),
        totalAmount: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
        date: new Date().toLocaleString(),
      };

      // Save to Excel
      saveOrderToExcel(orderDetails);

      res.json({
        success: true,
        message: "Payment verified & saved to Excel ✅",
        orderDetails,
      });
    } else {
      res.json({ success: false, message: "Payment verification failed ❌" });
    }
  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
