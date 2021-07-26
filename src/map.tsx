import {MapContainer, TileLayer,Marker,Popup,PopupProps,useMap, useMapEvents} from 'react-leaflet';
import {LatLng, latLng, LatLngBoundsExpression, LatLngExpression, LatLngTuple, Map} from 'leaflet'
import React,{useState} from 'react'
import { Button,TextField } from '@material-ui/core';
// tslint:disable-next-line
//@ts-ignore
import queryOverpass from '@derhuerst/query-overpass'
import {overpass,OverpassBbox,OverpassElement,OverpassWay,OverpassResponse,OverpassJson} from 'overpass-ts'
import {Alert} from '@material-ui/lab'
import 'leaflet/dist/leaflet.css';

function formatAddressQueryResultsSetHtmlElement(results: OverpassJson) {
  let addrCity;
  let addrNumber;
  let addrStreet;
  let address: string;
  for(let k=0; k<results.elements.length;k++) {
    let element = results.elements[k];
    if (element.type !== "way") {
      continue;
    } else {
      addrCity = element?.tags?.hasOwnProperty("addr:city") ? " " + element.tags["addr:city"] : ""
      addrNumber = element?.tags?.hasOwnProperty("addr:housenumber") ? element.tags["addr:housenumber"] : ""
      addrStreet = element?.tags?.hasOwnProperty("addr:street") ? " " + element.tags["addr:street"] : ""
      address = addrNumber
      address = address.concat(addrStreet, addrCity)
      if ("" !== address) {
        return address;
      }
    }
  }
  return "";
}

function SetLocationMarker() {
  let initialPosition: LatLngExpression= [0,0];
  const [position, setPosition] = useState(null);
  const [firstRun,setFirstRun] = useState(true);
  let mapInstance = useMap();
  const [address, setAddress] = useState("");
  async function setAddressFromOverpassQuery (latLng:LatLng,setterFunc: (newstring:string)=>void) {
    try {
      let query =`[out:json];nwr(around:10,${latLng.lat},${latLng.lng});out body;`
      let results = await overpass(query) as OverpassJson;
      setterFunc(formatAddressQueryResultsSetHtmlElement(results));                         
      console.log("overpass query returned address: " + address);
    } catch (error) {
      console.error(error);
    }
  }
  
  useMapEvents({
    click: async (event)=>{
      if (firstRun) {
        setFirstRun(false)
        mapInstance.locate()
      } else {
        setPosition(event.latlng as any)
        setAddressFromOverpassQuery(event.latlng,setAddress)
      }
    },
    locationfound: (event)=>{
      setPosition(event.latlng as any)
      setAddressFromOverpassQuery(event.latlng,setAddress)
      mapInstance.flyTo(event.latlng, mapInstance.getZoom())
    }
  })
  if (null !== position) {
    (document.getElementById('addr-value') as HTMLInputElement).value = address;
    return(
      <Marker position={position as unknown as LatLngExpression}>
        <Popup>{address!==""?"are you here?: " + address:""} </Popup>
      </Marker>
    );
  } else {
    return null;
  }
}

type voidfunc = ()=>{}
type LocationMarkerState = {
    position: LatLngExpression|null;
    firstClick: boolean;
    parentComponent: MapWithPlaceholder;
    address: string;
}
type LocationMarkerProps = {
  parentComponent: MapWithPlaceholder;
}
class LocationMarker extends React.Component<LocationMarkerProps, LocationMarkerState> {
  constructor(props: LocationMarkerProps) {
    super(props)
    this.setState({
      position: null,
      firstClick: true,
      parentComponent: props.parentComponent
    })
  }
  

  render() {
    try {
      let latLng = this?.state?.position as LatLngExpression;
      return this?.state?.position === null ? null : (
        <Marker position={latLng}>
          <Popup>are you here?: {this?.state?.address} </Popup>
        </Marker>
      )
    } catch (error) {
      console.error(error)
    }
  }

}




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
    addressNotFound: boolean;
    overpassError: boolean;
    overpassErrorMsg: string;
    address: string;
    map: Map;
    isAddressNotFound: ()=>boolean;

  }
  type MapWithPlaceholderProps = {
  }
  const mybounds: LatLngBoundsExpression = [[45.48965204000928,-122.66239643096925],[45.50168487047437,-122.63664722442628]];
  export class MapWithPlaceholder extends React.Component<{},MapState> {
    constructor(props: {}) {
      super(props);
      this.setState({
        addressNotFound: false,
        overpassError: false,
      })

      this.verifyAddress = this.verifyAddress.bind(this);
    
    }

    async verifyAddress() {
      let addr = (document.getElementById('addr-value') as HTMLInputElement).value;
      let addrregex = /^([0-9]+)\s+(?:(?:SE)|(?:Southeast))\s+([^\s]+).*/i;

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
            this.setState({
              addressNotFound: true
            })
            if (null !== pymtForm) {
              pymtForm.style.visibility = "hidden"
            }
          }
        } catch (error) {
          console.error(error?.message);
          if (null !== pymtForm){
            pymtForm.style.visibility = "hidden";
          }
          this.setState({
            overpassError: true,
            overpassErrorMsg: error?.message
          })
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
              whenCreated={(map)=>{
                this.setState({
                  map: map
                })
              }}
              whenReady={()=>{
                console.log("This function will fire once the map is created")
              }}
              placeholder={<MapPlaceholder />}>
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <SetLocationMarker></SetLocationMarker>
            </MapContainer>
            <div id='map-form'>
    
              <h3 id="plaque-request-header">I want to order an historic plaque for:</h3>
    
              <form id="address-fo  rm">
    
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
          </div>
        )
  }
}

