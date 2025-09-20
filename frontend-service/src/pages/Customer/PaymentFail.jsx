import React from 'react';
import '../../styles/PaymentFail.css';

const PaymentFail = () => {
  return (
    <div className="payment-failed">
      <div className="card">
        <h1>Payment Failed</h1>
        <p>Unfortunately, your transaction could not be completed.</p>
        <button onClick={() => window.location.href = '/retry'}>Try Again</button>
      </div>
    </div>
  );
};

export default PaymentFail;
