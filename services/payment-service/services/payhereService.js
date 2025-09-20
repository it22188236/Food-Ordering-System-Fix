// const crypto = require("crypto");
// const { getUserData } = require("./userService");

// const merchant_id = process.env.PAYHERE_MERCHANT_ID;
// const payhere_secret = process.env.PAYHERE_SECRET;
// const return_url = process.env.PAYHERE_RETURN_URL;
// const cancel_url = process.env.PAYHERE_CANCEL_URL;
// const notify_url = process.env.PAYHERE_NOTIFY_URL;
// const checkout_url = process.env.PAYHERE_CHECKOUT_URL;

// class PayhereService {
//   generateCheckoutData(payment) {
//     const { orderID, amount, items, userID, token } = payment;

//     // Format items for PayHere
//     const itemsDescription = items
//       .map((item) => `${item.menuName} x ${item.quantity}`)
//       .join(", ");

//     const user = getUserData(userID, token);
//     if(!user){
//         console.log("No user record found.")
//     }

//     return {
//       merchant_id: merchant_id,
//       return_url: return_url,
//       cancel_url: cancel_url,
//       notify_url: notify_url,
//       order_id: orderID,
//       items: itemsDescription,
//       amount: amount.toFixed(2),
//       currency: payment.currency || "LKR",
//       first_name: user.data.first_name,
//       email: user.data.email,
//       phone: user.data.phone,
//       address: user.data.address,
//       city: "Colombo",
//       country: "Sri Lanka", // Default if not provided
//       delivery_address: user.data.address,
//       delivery_city: "Colombo",
//       delivery_country: "Sri Lanka",
//       custom_1: payment._id.toString(),
//       hash: this.generateHash(orderID, amount),
//     };
//   }

//   generateHash(orderId, amount) {
//     // Format amount with 2 decimal places
//     const formattedAmount = amount.toFixed(2);

//     // PayHere hash format: md5(merchantId + orderId + amount + currency + merchantSecret)
//     const dataString = `${merchant_id}${orderId}${formattedAmount}LKR${payhere_secret}`;

//     return crypto
//       .createHash("md5")
//       .update(dataString)
//       .digest("hex")
//       .toUpperCase();
//   }

//   verifyPayhereSignature(paymentData) {
//     const {
//       merchant_id,
//       order_id,
//       payhere_amount,
//       payhere_currency,
//       status_code,
//       md5sig,
//     } = paymentData;

//     // Recreate the MD5 signature
//     const dataString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${payhere_secret.toUpperCase()}`;

//     const calculatedSignature = crypto
//       .createHash("md5")
//       .update(dataString)
//       .digest("hex")
//       .toUpperCase();

//     // Compare signatures
//     return calculatedSignature === md5sig;
//   }
// }

// module.exports = new PayhereService();


module.exports.generateCheckoutData = (order) => {
    return {
      merchant_id: process.env.PAYHERE_MERCHANT_ID,
      return_url: process.env.PAYHERE_RETURN_URL,
      cancel_url: process.env.PAYHERE_CANCEL_URL,
      notify_url: process.env.PAYHERE_NOTIFY_URL,
      order_id: order.orderID,
      items: order.items.map(item => item.name).join(", "),
      amount: order.amount,
      currency: "LKR",
      first_name: "Test",
      last_name: "User",
      email: "testuser@example.com",
      phone: "0771234567",
      address: "123, Galle Road",
      city: "Colombo",
      country: "Sri Lanka",
    };
  };
  