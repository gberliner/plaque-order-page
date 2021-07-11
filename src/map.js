import {MapContainer, TileLayer} from 'react-leaflet';
import {LatLngBoundsExpression} from 'leaflet'

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
    return (
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
    )
  }
  
