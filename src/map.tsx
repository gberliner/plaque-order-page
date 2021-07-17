import {MapContainer, TileLayer} from 'react-leaflet';
import {LatLngBoundsExpression} from 'leaflet'
import React from 'react'
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
    render() {
      let emailInvalid = document.getElementById('invalid-email')
      if (emailInvalid !== null) {
        emailInvalid.style.visibility = 'hidden'
      }
      let successMsg = document.getElementById('success-msg');
      if (null !== successMsg) {
        successMsg.style.visibility = 'hidden';
      }
      let email = (document.getElementById('email-conf') as HTMLInputElement).value;
      if ((email === null || -1 === email.search(/@/)) && null !== emailInvalid) {
        emailInvalid.style.visibility = 'visible';
        return;
      }

      let addr = (document.getElementById('addr-value') as HTMLInputElement).value;
      let addrregex = /^([0-9]+)\s+(?:(?:SE)|(?:Southeast))\s+(.*)/i;
      let parsedAddress = addr.match(addrregex);
      if (parsedAddress !== null && parsedAddress.length === 3) {
        var houseNumber = parsedAddress[1];
        var streetName = parsedAddress[2];
        let addressNotFound = document.getElementById('address-not-found');
        let pymtForm = document.getElementById('payment-form')
        let verifyAddress = async () => {
        queryOverpass(`
          [out:json][timeout:120][bbox:45.48965204000928,-122.66239643096925,45.50168487047437,-122.63664722442628];
          nwr["addr:housenumber"="${houseNumber}"]["addr:street"~"${streetName}"];
          out body;
        `, {endpoint: "https://overpass.kumi.systems/api/interpreter"}).then(
        // await qop(houseNumber,streetName);
          (res: any[]) => {
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
          }).catch((error: any)=>{
            console.error(error?.message)
          })
        }
        
    
    
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
      <h2 id="plaque-request-header">I want to order an historic plaque for:</h2>
      <form id="address-form">
          <label htmlFor="addr-value">Street Address&nbsp;&nbsp;&nbsp;</label>
          <input id="addr-value" type="text" name="streetAddress"></input>
          <br></br>          
          <label htmlFor="email-conf">Email Address&nbsp;&nbsp;&nbsp;</label>
          <input id="email-conf" type="text" name="emailAddress"></input>
          <div id="address-container"></div>
          <button id="verify-address" type="button" onClick={verifyAddress}>Verify</button>
      </form>
      <div id="address-not-found">
        <p>Sorry, I couldn't find that address in Brooklyn neighborhood. Please try again.</p>
      </div>
      <div id="invalid-email">
        <p>Invalid email address.</p>
      </div>


      </div>
    )
    }
  } 
}