import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {PaymentPage} from './PaymentPage'
import reportWebVitals from './reportWebVitals';
import {MapWithPlaceholder} from './map'
import 'react-square-payment-form/lib/default.css'
ReactDOM.render(
  <React.StrictMode>
    <MapWithPlaceholder />
    <div id="success-msg">
            <p>Congratulations! We have received your payment, and 
              will order your historic plaque made as soon as 
              sufficient orders from your neighbors also come in 
              (we get a discount making them in groups of three 
              or more)</p> 
    </div>
    <PaymentPage />
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
