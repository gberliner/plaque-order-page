import Square from 'square'
import { SquarePaymentForm,
    CreditCardNumberInput,
    CreditCardExpirationDateInput,
    CreditCardPostalCodeInput,
    CreditCardCVVInput,
    CreditCardSubmitButton,
    
 } from 'react-square-payment-form'
import {SqVerificationDetails} from 'react-square-payment-form/lib/components/models'
 import React from 'react'
import 'react-square-payment-form/lib/default.css'
import { SqCardData, SqContact, SqError, SqShippingOption } from 'react-square-payment-form/lib/components/models';
import {FormControl, FormGroup, TextField, Accordion, AccordionSummary, AccordionDetails} from '@material-ui/core'
import {ExpandMore} from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles';

if (process.env.NODE_ENV !== "production") {
    var dotenv = require ('dotenv');
    dotenv.config();
    console.log()
}

async function getCurrentPrice() {
 
  let res = await fetch("/check-price");
  let results = await res.json();
  return results["price"];
}
type PaymentPageState = {
  price: number;
  errorMessages: String[] 
}
export class PaymentPage extends React.Component<{},PaymentPageState> {

    constructor(props: {} | Readonly<{}>) {
      super(props)
      this.state = {
        price: 9999,
        errorMessages: [],
      }
    }
 
    cardNonceResponseReceived = (errors: SqError[]|null, nonce: string,
       cardData: SqCardData, 
       buyerVerificationToken?: string|undefined,
       billingContact?: SqContact|undefined,
       shippingContact?: SqContact|undefined,
       shippingOption?: SqShippingOption|undefined) => {
      if (errors) {
        this.setState({ errorMessages: errors.map((error: any) => error?.message) })
        return
      }
  
      this.setState({ errorMessages: [] })
      //alert("nonce created: " + nonce + ", buyerVerificationToken: " + buyerVerificationToken)
      
      let email = (document.getElementById('email-conf') as HTMLInputElement).value;
      let address = (document.getElementById('addr-value') as HTMLInputElement).value;
      let payload = {email,address,nonce,buyerVerificationToken}
      fetch('/api/process-payment', {
        method: 'POST',
        body: JSON.stringify(payload)
      }).then(res => {
        let successMsg = document.getElementById('success-msg')
        if (null !== successMsg) {
          successMsg.style.visibility = 'visibility'
        }
        let pymtForm = document.getElementById('payment-form')
        if (null !== pymtForm) {
          pymtForm.style.visibility = 'hidden'
        }
      }).catch(error => {
        console.error(error.message);
      })
    }
  
    createVerificationDetails() {
      let email = (document.getElementById('email-conf') as HTMLInputElement).value;
      let firstName = (document.getElementById('buyerFirstName') as HTMLInputElement).value;
      let lastName = (document.getElementById('buyerLastName') as HTMLInputElement).value;
      let city = (document.getElementById('city') as HTMLInputElement).value;
      let state = (document.getElementById('state') as HTMLInputElement).value;
      let address = (document.getElementById('billing-street-address') as HTMLInputElement).value;
      let zipcode = (document.getElementById('zipcode') as HTMLInputElement).value
      let phone = (document.getElementById('phone') as HTMLInputElement).value
      let vDetails: SqVerificationDetails = {
        billingContact: {
          email: email,
          addressLines: [address],
          city: city,
          familyName: lastName,
          givenName: firstName,
          region: state,
          country: 'US',
          postalCode: zipcode,
          phone: phone
        },
        intent: "CHARGE",
        currencyCode: "USD",
        amount: (this.state.price/100).toLocaleString()
      }

      return(vDetails)
    }

    componentDidMount() {
      fetch('/check-price').then(res => {
        res.json().then(pricedata =>{
          this.setState(
            {
              price: pricedata.price
            }
          )
        }).catch(error => {
          let newErrorMessages = this.state.errorMessages;
          newErrorMessages.push(error.message)
          this.setState({
            errorMessages: newErrorMessages
          })
        })
      })
    }
  
    render() {
      
      return (
        <div id="payment-form">

          
          <SquarePaymentForm
            sandbox={process.env.NODE_ENV !== "production"?true:false}
            applicationId={process.env.REACT_APP_SANDBOX_APPLICATION_ID!==null?(process.env.REACT_APP_SANDBOX_APPLICATION_ID as string):""}

            locationId={process.env.REACT_APP_SANDBOX_LOCATION_ID!==null?(process.env.REACT_APP_SANDBOX_LOCATION_ID as string):""}
            cardNonceResponseReceived={this.cardNonceResponseReceived}
            createVerificationDetails={this.createVerificationDetails}
            formId="sqPaymentForm"
            apiWrapper={SquarePaymentForm?.defaultProps?.apiWrapper ?? ""}
          >
          <h1>Payment Details (current cost: {this.state.price})</h1>
            
            <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-label="Expand"
              aria-controls="additional-actions1-content"
              id="additional-actions1-header">
                    
              <p>Enter your billing address</p>
              <fieldset>
              <TextField 
                id="buyerFirstName"
                label="First name"
                helperText="Required">
              </TextField>

              <TextField 
                id="buyerLastName"
                label="Last name"
                helperText="Required">
              </TextField>
              </fieldset>
              <TextField 
                id="billing-street-address"
                label="Billing street address"
                helperText="Required">
              </TextField>

              <TextField 
                id="city"
                label="City"
                helperText="Required">
              </TextField>
              <TextField 
                id="state"
                label="State"
                helperText="Required">
              </TextField>
              <TextField 
                id="zip"
                label="Zip code"
                helperText="Required">
              </TextField>
              <TextField 
                id="phone"
                label="Phone"
                helperText="Required">
              </TextField>
              
            </AccordionSummary>   
            <AccordionDetails>
            </AccordionDetails>         
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-label="Expand"
              aria-controls="additional-actions1-content"
              id="additional-actions1-header">
                    
              <p>Credit Card Details</p>


            </AccordionSummary>   
            <AccordionDetails>
            <fieldset className="sq-fieldset">
            <CreditCardNumberInput />
            <div className="sq-form-third">
            <CreditCardExpirationDateInput />
            </div>

            <div className="sq-form-third">
            <CreditCardPostalCodeInput />
            </div>

            <div className="sq-form-third">
            <CreditCardCVVInput />
            </div>
        </fieldset>

            </AccordionDetails>         
          </Accordion>


        <CreditCardSubmitButton>
          Pay ${this.state.price}
        </CreditCardSubmitButton>
      </SquarePaymentForm>
  
          <div className="sq-error-message">
            {this.state.errorMessages.map(errorMessage =>
              <li key={`sq-error-${errorMessage}`}>{errorMessage}</li>
            )}
          </div>
          
        </div>
      )
    }
  }
