import logo from './logo.svg';
import './App.css';
import {MapWithPlaceholder} from './map'
import {PaymentPage} from './PaymentPage'

import 'leaflet/dist/leaflet.css';
import React from 'react';

type PlaqueAppState = {
  plaquePrice: Number;
  orderId: string;
}

export default class App extends React.Component<{},PlaqueAppState> {
  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.state = {
      plaquePrice: 9999,
      orderId: ""
    }
  }
  render() {
    const price = this.state.plaquePrice;
    const orderId = this.state.orderId; 
    return (
    <div className="App">
          <MapWithPlaceholder />
 
    
    <PaymentPage />
    <div id="success-msg">
            <p>Congratulations! We have received your payment, and 
              will order your historic plaque made as soon as 
              sufficient orders from your neighbors also come in 
              (we get a discount making them in groups of three 
              or more)</p> 
    </div>
    </div>
    
  );
}
}