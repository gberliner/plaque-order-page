import {MapContainer, TileLayer} from 'react-leaflet';
import {LatLngBoundsExpression} from 'leaflet'
import queryOverpass from '@derhuerst/query-overpass'

async function qop(houseNumber,streetName) {
  try {
          let response = await queryOverpass(`
  [out:json][timeout:120][bbox:45.48965204000928,-122.66239643096925,45.50168487047437,-122.63664722442628];
  nwr["addr:housenumber"="${houseNumber}"]["addr:street"~"${streetName}"];
  out body;
`, {endpoint: "https://overpass.kumi.systems/api/interpreter"});
          console.log(response);
          console.log("length = " + response.length);
          for (var idx in response) {
                  for (var key in response[idx]) {
                          if (response[idx].hasOwnProperty(key)) {
                                  console.log("key: " + key + "\t" + "val: " + response[idx][key])
                          }
                  }
          }
          return response;
  } catch (e) {
          console.log(e);
  }
  
}

function MapPlaceholder() {
    return (
      <p>
        Map of London.{' '}
        <noscript>You need to enable JavaScript to see this map.</noscript>
      </p>
    )
  }
  //        center={[51.505, -0.09]}

  let mybounds = [[45.48965204000928,-122.66239643096925],[45.50168487047437,-122.63664722442628]];
  export function MapWithPlaceholder() {
    var verifyAddress = async () => {
      document.getElementById('invalid-email').style.visibility = 'hidden';
      document.getElementById('success-msg').style.visibility = 'hidden';
      let email = document.getElementById('email-conf').value;
      if (email === null || -1 === email.search(/@/)) {
        document.getElementById('invalid-email').style.visibility = 'visible';
        return;
      }

      let addr = document.getElementById('addr-value').value;
      let addrregex = /^([0-9]+)\s+(?:(?:SE)|(?:Southeast))\s+(.*)/i;
      let parsedAddress = addr.match(addrregex);
      if (parsedAddress !== null && parsedAddress.length === 3) {
        var houseNumber = parsedAddress[1];
        var streetName = parsedAddress[2];
        var res = await queryOverpass(`
        [out:json][timeout:120][bbox:45.48965204000928,-122.66239643096925,45.50168487047437,-122.63664722442628];
        nwr["addr:housenumber"="${houseNumber}"]["addr:street"~"${streetName}"];
        out body;
      `, {endpoint: "https://overpass.kumi.systems/api/interpreter"});
        // await qop(houseNumber,streetName);
          if (res.length === 1 && res[0].hasOwnProperty("tags") && res[0].tags.hasOwnProperty("addr:city") && res[0].tags["addr:city"] === "Portland") {
            console.log("found Portland address, displaying pymt options");
            document.getElementById('payment-form').style.visibility = "visible";
            document.getElementById('address-not-found').style.visibility = "hidden";            
          } else {
            console.log("No such address found in Portland");
            document.getElementById('address-not-found').style.visibility = "visible";
            document.getElementById('payment-form').style.visibility = 'hidden';
          }
      }
    }
    var togglePayment = () => {
      let e = document.getElementById('payment-form');

      e.style.visibility = 'visible';
  
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
  
