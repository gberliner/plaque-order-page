import { SquarePaymentForm,
    CreditCardNumberInput,
    CreditCardExpirationDateInput,
    CreditCardPostalCodeInput,
    CreditCardCVVInput,
    CreditCardSubmitButton
 } from 'react-square-payment-form'
import React from 'react'
import 'react-square-payment-form/lib/default.css'
import { SqCardData, SqContact, SqError, SqShippingOption } from 'react-square-payment-form/lib/components/models';
if (process.env.NODE_ENV !== "production") {
    var dotenv = require ('dotenv');
    dotenv.config();
    console.log()
}

async function getCurrentPrice() {
 
  let res = await fetch("/plaqueprice");
  let results = await res.json();
  return results["price"];
}
type PaymentPageState = {
  price: Number;
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
      let payload = {
        nonce: nonce,
        token: buyerVerificationToken
      }
      let email = (document.getElementById('email-conf') as HTMLInputElement).value;
      let addr = (document.getElementById('addr-value') as HTMLInputElement).value;
      fetch('/api/payment-process', {
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
      return {
        amount: '100.00',
        currencyCode: "USD",
        intent: "CHARGE",
        billingContact: {
          familyName: "Smith",
          givenName: "John",
          email: "jsmith@example.com",
          country: "GB",
          city: "London",
          addressLines: ["1235 Emperor's Gate"],
          postalCode: "SW7 4JA",
          phone: "020 7946 0532"
        }
      }
    }

    componentDidMount() {
      fetch('/checkprice').then(res => {
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
          <h1>Payment Details (current cost: {this.state.price})</h1>
  
          <SquarePaymentForm
            sandbox={process.env.NODE_ENV !== "production"?true:false}
            applicationId={process.env.REACT_APP_SANDBOX_APPLICATION_ID!==null?(process.env.REACT_APP_SANDBOX_APPLICATION_ID as string):""}

            locationId={process.env.REACT_APP_SANDBOX_LOCATION_ID!==null?(process.env.REACT_APP_SANDBOX_LOCATION_ID as string):""}
            cardNonceResponseReceived={this.cardNonceResponseReceived}
            createVerificationDetails={this.createVerificationDetails}
            formId={"undefined"}
            apiWrapper={"undefined"}
          >

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
