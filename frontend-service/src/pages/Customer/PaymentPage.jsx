import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import '../../styles/PaymentPage.css'

const PaymentPage = () => {
  const { orderID } = useParams();
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const initiatePayment = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:5041/api/payment/initiate/${orderID}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Create a form dynamically
      const form = document.createElement("form");
      form.method = "POST";
      form.action = response.data.paymentUrl;
      form.style.display = "none";

      // Add all payment data as hidden inputs
      Object.entries(response.data.paymentData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      // Add form to document and submit
      document.body.appendChild(form);
      form.submit();

      // Clean up
      document.body.removeChild(form);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error(error.response?.data?.error || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="flex justify-center items-center h-screen">
    //   <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
    //     <h1 className="text-2xl font-bold mb-4">Complete Your Payment</h1>
    //     <p className="mb-6">Order ID: {orderID}</p>

    //     <button
    //       onClick={initiatePayment}
    //       disabled={loading}
    //       className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg ${
    //         loading ? "opacity-50 cursor-not-allowed" : ""
    //       }`}
    //     >
    //       {loading ? "Processing..." : "Pay with PayHere"}
    //     </button>

    //     <div className="mt-6 text-sm text-gray-500">
    //       <p>
    //         <strong>Sandbox Mode:</strong> Use test card 4242 4242 4242 4242
    //       </p>
    //       <p className="mt-2">Expiry: Any future date | CVC: Any 3 digits</p>
    //     </div>
    //   </div>
    // </div>

    <div className="payment-container">
      <div className="payment-card">
        <h1 className="payment-title">Complete Your Payment</h1>
        <p className="order-id">Order ID: {orderID}</p>

        <button
          onClick={initiatePayment}
          disabled={loading}
          className="payment-button"
        >
          {loading ? "Processing..." : "Pay with PayHere"}
        </button>

        {/* <div className="sandbox-info">
          <p>
            <strong>Sandbox Mode:</strong> Use test card 4242 4242 4242 4242
          </p>
          <p>Expiry: Any future date | CVC: Any 3 digits</p>
        </div> */}
      </div>
    </div>
  );
};

export default PaymentPage;
