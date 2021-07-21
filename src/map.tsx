import {MapContainer, TileLayer} from 'react-leaflet';
import {LatLngBoundsExpression} from 'leaflet'
import React from 'react'
import { TextField } from '@material-ui/core';
// tslint:disable-next-line
//@ts-ignore
import queryOverpass from '@derhuerst/query-overpass'

function MapPlaceholder() {
    return (
      <p>
        Map of Brooklyn Neighborhood.{' '}
        <noscript>You need to enable JavaScript to see this map.</noscript>
      </p>
    )
  }
  //        center={[51.505, -0.09]}
  type MapState = {

  }
  const mybounds: LatLngBoundsExpression = [[45.48965204000928,-122.66239643096925],[45.50168487047437,-122.63664722442628]];
  export class MapWithPlaceholder extends React.Component<{},MapState> {
    constructor(props: {}) {
      super(props);
      this.verifyAddress = this.verifyAddress.bind(this);
    }

    async verifyAddress() {
      let addr = (document.getElementById('addr-value') as HTMLInputElement).value;
      let addrregex = /^([0-9]+)\s+(?:(?:SE)|(?:Southeast))\s+(.*)/i;
      let parsedAddress = addr.match(addrregex);
      if (parsedAddress !== null && parsedAddress.length === 3) {
        var houseNumber = parsedAddress[1];
        var streetName = parsedAddress[2];
        let addressNotFound = document.getElementById('address-not-found');
        let overpassError = document.getElementById('overpass-error');
        let pymtForm = document.getElementById('plaque-payment-form')
        try {
          let res = await queryOverpass(
            `[out:json][timeout:120][bbox:45.48965204000928,-122.66239643096925,45.50168487047437,-122.63664722442628];
          nwr["addr:housenumber"="${houseNumber}"]["addr:street"~"${streetName}"];
          out body;`, {endpoint: "https://overpass.kumi.systems/api/interpreter"});
          if (res.length === 1 && res[0]?.tags.hasOwnProperty("addr:city") && res[0].tags["addr:city"] === "Portland") {
            console.log("found Portland address, displaying pymt options");         
            if (null !== pymtForm){
              pymtForm.style.visibility = "visible";
            }
            if (null !== addressNotFound) {
              addressNotFound.style.visibility = "hidden";            
            }            
          } else {
            console.log("No such address found in Portland");
            if (null !== addressNotFound) {
              addressNotFound.style.visibility = "visible";
            }
       
            if (null !== pymtForm) {
              pymtForm.style.visibility = "hidden"
            }
          }
        } catch (error) {
          console.error(error?.message);
          if (null !== pymtForm){
            pymtForm.style.visibility = "hidden";
          }
          if (null !== addressNotFound) {
            addressNotFound.style.visibility = "visible";            
          }   
          let errorDivElement: HTMLDivElement;    
          if (null !== overpassError) {
            errorDivElement = overpassError as HTMLDivElement;
            let errorMsgElement: HTMLParagraphElement= (document.getElementById("overpass-error-message") as HTMLParagraphElement);
            errorMsgElement.innerText += ": " + error.message
            errorDivElement.style.visibility = 'visible'

          }
        }
      }
    }

  render() {
    return (
      <div>
        <MapContainer
          bounds={mybounds}
          zoom={13}
          scrollWheelZoom={false}
          placeholder={<MapPlaceholder />}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
        <div id="overpass-error">
          <p id="overpass-error-message">Error connecting to Overpass server, try again</p>
        </div>
        <h3 id="plaque-request-header">I want to order an historic plaque for:</h3>
        <div className="blue"><p id="address-not-found">Sorry, that address was not found in Brooklyn</p></div>

        <form id="address-form">
          
        <div className="float-container">

<div className="float-child-left">
  <div className="green">
  
<TextField 
              id="addr-value"
              label="Street address of your historic Brooklyn home"
              variant="filled"
              helperText="Required">
            </TextField>
  </div>
</div>

<div className="float-child-right">
<button id="verify-address" type="button" onClick={this.verifyAddress}>Verify</button>

</div>

</div>

          <br></br>
          <div id="address-container"></div>
        </form>
        
  
 
      </div>
    )
  }
}

