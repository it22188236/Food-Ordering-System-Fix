// import { useEffect } from "react";
// import { createOrder, captureOrder } from "../api/api";

// const PayPalButton = () => {
//   useEffect(() => {
//     const addPayPalScript = async () => {
//       if (window.paypal) {
//         renderButton(); // already loaded
//         return;
//       }

//     //   const script = document.createElement("script");
//     //   script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID";
//     //   script.async = true;
//     //   script.onload = renderButton;
//     //   document.body.appendChild(script);
//     };

//     const renderButton = () => {
//       window.paypal
//         .Buttons({
//           createOrder: async () => {
//             const res = await createOrder();
//             //const data = await res.json();
//             //return data.id;
//             console.log("Create order ID : ",res.data.id)
//             return res.data.id;
            
//           },
//           onApprove: async (data) => {
//             const res = await captureOrder(data.orderID);
//             // const orderData = await res.json();
//             // console.log("Order Captured:", orderData);
//             console.log("Order Captured:", res);
//           },
//           onError: (err) => {
//             console.error("PayPal Checkout Error:", err);
//           },
//         })
//         .render("#paypal-button-container");
//     };

//     addPayPalScript();
//   }, []);

//   return <div id="paypal-button-container"></div>;
// };

// export default PayPalButton;

import { useEffect, useRef } from "react";
import { createOrder, captureOrder } from "../api/api";

const PayPalButton = () => {
  const isInitialized = useRef(false); // ✅ flag to avoid double init

  useEffect(() => {
    if (isInitialized.current) return; // ✅ Already initialized
    isInitialized.current = true;

    const renderButton = () => {
      window.paypal
        .Buttons({
          createOrder: async () => {
            const res = await createOrder();
            console.log("Create order ID:", res.data.id);
            return res.data.id;
          },
          onApprove: async (data) => {
            const res = await captureOrder(data.orderID);
            console.log("Order Captured:", res);
          },
          onError: (err) => {
            console.error("PayPal Checkout Error:", err);
          },
        })
        .render("#paypal-button-container");
    };

    const addPayPalScript = async () => {
      if (window.paypal) {
        renderButton();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD";
      script.async = true;
      script.onload = renderButton;
      document.body.appendChild(script);
    };

    addPayPalScript();
  }, []); // ✅ runs only once

  return <div id="paypal-button-container"></div>;
};

export default PayPalButton;
