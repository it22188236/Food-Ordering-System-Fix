const crypto = require("crypto");

const generatePayHereHash = (
  merchant_id,
  order_id,
  payhere_amount,
  payhere_currency,
  status_code,
  merchantSecret
) => {
  const hashString = `${merchantId}${orderId}${amount}${currency}${statusCode}${merchantSecret}`;
  return crypto.createHash("md5").update(hashString).digest("hex");
};

module.exports = generatePayHereHash;
