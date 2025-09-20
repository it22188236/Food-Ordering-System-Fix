import React from 'react';
import '../../styles/PaymentSuccess.css';

const PaymentSuccess = () => {
  return (
    <div className="payment-success">
      <div className="card">
        <h1>Payment Successful</h1>
        <p>Your transaction was completed successfully.</p>
        <button onClick={() => window.location.href = '/dashboard'}>Go to Home</button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
