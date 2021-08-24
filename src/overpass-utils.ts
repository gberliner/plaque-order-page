import { Convert, OverpassResultSet,Tags } from "./overpassResultSet";

export function fmtAddressQueryResults(results: string) {
    let addrCity;
    let addrHousenumber;
    let addrStreet;
    let address: string = "";
    const overpassResultSet = Convert.toOverpassResultSet(results);
    if (!!overpassResultSet && overpassResultSet !== undefined && overpassResultSet?.elements !== undefined && overpassResultSet?.elements?.length >= 1) {

    for(let k=0; k<overpassResultSet.elements.length;k++) {
      if (overpassResultSet.elements[k].tags !== undefined) {
        ({
          addrCity,
          addrHousenumber,
          addrStreet
        } = (overpassResultSet.elements[k].tags as Tags));
      }
      address = addrHousenumber??""
      address = (address!=="")?address + " ":address;
      address = address.concat(addrStreet??"", " ", addrCity??"")
      if ("" !== address && " " !== address) {
        return address;
      }
    }
    return "";
  }
}