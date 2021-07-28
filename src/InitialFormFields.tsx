import {TextField,Dialog,Button} from '@material-ui/core'
import {OverpassResponse,OverpassJson,overpass,} from 'overpass-ts'
import { useState, useEffect, MouseEvent } from 'react';
import { NewPaymentForm } from './NewPaymentForm';
import {fmtAddressQueryResults} from './overpass-utils'
export function InitialFormFields(props: {
}) {
    const [address, setAddress] = useState('')
    const [addressNotFound,setAddressNotFound] = useState(true)
    const [overpassErrorMsg,setOverpassErrorMsg] = useState("")
    const [addressValidated,setAddressValidated] = useState(false)
    const [validationError,setValidationError] = useState(false)
    const [paymentSucceeded,setPaymentSucceeded] = useState(false)
    const [validationErrorMsg,setValidationErrorMsg] = useState("")
    function openPaymentDialog() {
        return paymentSucceeded || validationError || addressValidated;
    }
    useEffect(()=>{
        (document.getElementById('addr-value') as HTMLInputElement).dispatchEvent(new Event('onChange'));
        if (!addressValidated && validationError) {
            
        }
    },[address,validationError,addressValidated,overpassErrorMsg]
    )
    function resetForm(withPaymentSucceeded: boolean){
        setAddressValidated(false)
        setValidationError(false)
        withPaymentSucceeded && setPaymentSucceeded(true)
    }
    async function verifyAddress() {
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
                let res = await overpass(
                    `[out:json][timeout:120][bbox:45.48965204000928,-122.66239643096925,45.50168487047437,-122.63664722442628];
            nwr["addr:housenumber"="${houseNumber}"]["addr:street"~"${streetName}"];
            out body;`, { endpoint: "https://overpass.kumi.systems/api/interpreter" }) as OverpassJson
                let updatedAddress = fmtAddressQueryResults(res);
                if (updatedAddress !== "") {
                    setAddressValidated(true);
                    setAddress(updatedAddress)
                    return false
                } else {
                    setAddressValidated(false);
                    setValidationErrorMsg("Address not found in Brooklyn")
                    return true
                }
            } catch (error) {
                setAddressValidated(false)
                console.error(error?.message);
                if (null !== pymtForm) {
                    pymtForm.style.visibility = "hidden";
                }
                setValidationErrorMsg("Error from overpass server: " + error?.message)
                setOverpassErrorMsg(error?.message);
                return true
            }
        }
        return true
    }


      function validateYear() {
        let yearValue = (document.getElementById('plaque-year') as HTMLInputElement).value
        let validYear = true
        validYear = null !== yearValue.match(/^\d{4}$/)
        validYear = null !== yearValue.match(/^(?:18)|(?:19)|(?:20)\d\d/)

        if (!validYear) {
            setValidationErrorMsg("Invalid year specified")    
        }
        return !validYear;
    }

    function validateCustomWords() {
        let validCustomWords = true
        validCustomWords = 30 >= (document.getElementById("plaque-optional-text") as HTMLInputElement).value.length;
        if (!validCustomWords) {
            setValidationErrorMsg("Optional text limited to thirty characters")
        }
        return !validCustomWords
    }

    async function validateFields(event: MouseEvent) {
        event.preventDefault()
        let res: boolean|Promise<boolean> = false;
        res = validateYear() || validateCustomWords() || verifyAddress()
        let validationErrorOccurred: boolean;
        try {
            validationErrorOccurred = await res;
            setValidationError(validationErrorOccurred)
        } catch (error) {
            console.error("Validation failed")
            setValidationErrorMsg("Validation failed due to possible system or network error")
            setValidationError(true);
        }        
    }
      
    return (
        <div id='initial-form-fields'>
            <Dialog open={openPaymentDialog()}>
                <NewPaymentForm 
                validationError={validationError} 
                validationErrorMsg={validationErrorMsg}
                resetForm={resetForm}></NewPaymentForm>
                <Button onClick={()=>{
                     resetForm(paymentSucceeded);
                }}>Cancel</Button>
            </Dialog>

            <h3 id="plaque-request-header">I want to order an historic plaque for:</h3>

            <form id="address-form">
                <div className="float-container">

                    <div className="float-child-left">
                        <div className="green">

                            <TextField
                                id="addr-value"
                                label="Historic home street address"
                                variant="filled"
                                onChange={
                                    (event)=>{
                                        event.target.defaultValue = address
                                    }
                                }
                                helperText="Required">
                            </TextField>
                        </div>
                    </div>

                    <div className="float-child-right">
                        <TextField id="plaque-year" label="Year built" variant="filled" inputProps={{ maxLength: 4 }} style={{ width: 100 }}></TextField>
                        <TextField id="plaque-optional-text" label="Brief optional text" variant="filled"></TextField>


                    </div>

                </div>
                <button id="verify-address" type="button" onClick={validateFields}>Verify</button>
                <br></br>
            </form>
        </div>
    )
}