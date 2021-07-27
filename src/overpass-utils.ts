import {overpass,OverpassBbox,OverpassElement,OverpassWay,OverpassResponse,OverpassJson} from 'overpass-ts'

export function fmtAddressQueryResults(results: OverpassJson) {
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
  