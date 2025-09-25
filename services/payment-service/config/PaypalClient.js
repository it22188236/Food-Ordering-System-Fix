import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";
dotenv.config();

const environment = () => {
  let clientId = process.env.PAYPAL_CLIENT_ID;
  let clientSecret = process.env.PAYPAL_SECRET_KEY;

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
};

const client = () => {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
};

export { client };