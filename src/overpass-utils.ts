import {overpass,OverpassBbox,OverpassElement,OverpassWay,OverpassResponse,OverpassJson} from 'overpass-ts'
import { Convert, OverpassResultSet,Tags } from "./overpassResultSet";

export function fmtAddressQueryResults(results: OverpassJson) {
    let addrCity;
    let addrHousenumber;
    let addrStreet;
    let address: string = "";
    const overpassResultSet = Convert.toOverpassResultSet(JSON.stringify(results));
    if (!!overpassResultSet && overpassResultSet !== undefined && overpassResultSet?.elements !== undefined && overpassResultSet?.elements?.length >= 1) {

    for(let k=0; k<overpassResultSet.elements.length;k++) {
      if (overpassResultSet.elements[k].tags !== undefined) {
        ({
          addrCity,
          addrHousenumber,
          addrStreet
        } = (overpassResultSet.elements[k].tags as Tags));
      }
     address = address.concat(addrStreet??"", addrCity??"")
      if ("" !== address) {
        return address;
      }
    }
    return "";
  }
}