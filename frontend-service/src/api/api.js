import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5041/api",
  withCredentials: true,
});

export const createOrder = () =>
  API.post(
    "/payment/createOrder",
    {},
    { headers: { "Content-Type": "application/json" } }
  );

export const captureOrder = (orderId) =>
  API.post(`/payment/captureOrder/${orderId}`);