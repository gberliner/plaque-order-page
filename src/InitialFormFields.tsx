import {TextField,Dialog,Button} from '@material-ui/core'
import { useState, useEffect } from 'react';
import { NewPaymentForm } from './NewPaymentForm';
import {fmtAddressQueryResults} from './overpass-utils'
import {LaddaButton,ZOOM_OUT,} from 'react-ladda-button'
import 'react-ladda-button/dist/ladda-themeless.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
export function InitialFormFields(props: {
}) {
    const [address, setAddress] = useState('')
    const [addressNotFound,setAddressNotFound] = useState(true)
    const [overpassErrorMsg,setOverpassErrorMsg] = useState("")
    const [addressValidated,setAddressValidated] = useState(false)
    const [validationError,setValidationError] = useState(false)
    const [paymentSucceeded,setPaymentSucceeded] = useState(false)
    const [validationErrorMsg,setValidationErrorMsg] = useState("")
    const [loading,setLoading] = useState(false);
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
                let query = `[out:json][timeout:120][bbox:45.48965204000928,-122.66239643096925,45.50168487047437,-122.63664722442628];
                nwr["addr:housenumber"="${houseNumber}"]["addr:street"~"${streetName}"];
                out body;`;
                let encoded_query = encodeURIComponent(query);
                let res =  await (await fetch(process.env.REACT_APP_OVERPASS_ENDPOINT + "?data=" + encoded_query)).text();
                
                let updatedAddress = fmtAddressQueryResults(res);
                if (!!updatedAddress && updatedAddress !== "") {
                    setAddressValidated(true);
                    setAddress(updatedAddress)
                    return false
                } else {
                    setAddressValidated(false);
                    setValidationErrorMsg("Address not found in Brooklyn")
                    setValidationError(true)
                    return true
                }
            } catch (error) {
                setAddressValidated(false)
                console.error(error?.message);
                if (null !== pymtForm) {
                    pymtForm.style.visibility = "hidden";
                }
                setValidationErrorMsg("Error from overpass server: " + error?.message)
                setValidationError(true)
                setOverpassErrorMsg(error?.message);
                return true
            }
        } else {
            setValidationErrorMsg("Address not found in Brooklyn")
            setValidationError(true)
        }
        return true
    }


    function validateYear() {
        let yearValue = (document.getElementById('plaque-year') as HTMLInputElement).value
        let validYear = true
        if (null === yearValue.match(/^\d{4}$/)) {
            validYear = false;
            setValidationErrorMsg("Invalid year specified")
            setValidationError(true)
            return !validYear;
        }
        if (!(yearValue.startsWith("18") || yearValue.startsWith("19"))) {
            validYear = false;
            setValidationErrorMsg("Invalid year specified")
            setValidationError(true)
            return !validYear;
        }
        return !validYear;
    }

    function validateCustomWords() {
        let validCustomWords = true
        validCustomWords = 30 >= (document.getElementById("plaque-optional-text") as HTMLInputElement).value.length;
        if (!validCustomWords) {
            setValidationErrorMsg("Optional text limited to thirty characters")
            setValidationError(true)
        }
        return !validCustomWords
    }

    async function validateFields(event: React.MouseEvent) {
        event.preventDefault()
        let res: boolean|Promise<boolean> = false;
        res = validateYear() || validateCustomWords() || verifyAddress()
        let validationErrorOccurred: boolean;
        try {
            validationErrorOccurred = await res;
        } catch (error) {
            console.error("Validation failed")
            setValidationErrorMsg("Validation failed due to possible system or network error")
            setValidationError(true);
        } finally {
            setLoading(false);
        }   
    }

    function toggleLoading(event: React.MouseEvent) {
        event.preventDefault();
        setLoading(true);
        setTimeout(()=>{validateFields(event)},1);
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
                        <TextField 
                        id="plaque-year" 
                        label="Year built" 
                        variant="filled" 
                        inputProps={{ 
                            maxLength: 4 
                        }} 
                        style={{ width: 100 }}>
                        </TextField>
                        <TextField 
                        id="plaque-optional-text"
                        label="Brief optional text" 
                        variant="filled"
                        inputProps={{
                            maxLength: 28
                        }}
                         >
                         </TextField>

                    </div>

                </div>

                <LaddaButton
                    id="verify-address"
                    data-style={ZOOM_OUT}
                    data-color="green"
                    loading={loading}
                    className="ladda-button btn btn-primary btn-large "                    onClick={toggleLoading}
                >Verify</LaddaButton>
                <br></br>
            </form>
        </div>
    )
}
