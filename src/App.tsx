import './App.css';
import {MapWithPlaceholder} from './map'
import { NewPaymentForm } from './NewPaymentForm';

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
        <NewPaymentForm />
      </div>
    );
}
}