import { SquarePaymentForm,
    CreditCardNumberInput,
    CreditCardExpirationDateInput,
    CreditCardPostalCodeInput,
    CreditCardCVVInput,
    CreditCardSubmitButton
 } from 'react-square-payment-form'
import React from 'react'
import 'react-square-payment-form/lib/default.css'
if (process.env !== "production") {
    var dotenv = require ('dotenv');
    dotenv.config();
    console.log()
}
export class PaymentPage extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        errorMessages: [],
      }
    }
  
    cardNonceResponseReceived = (errors, nonce, cardData, buyerVerificationToken) => {
      if (errors) {
        this.setState({ errorMessages: errors.map(error => error.message) })
        return
      }
  
      this.setState({ errorMessages: [] })
      //alert("nonce created: " + nonce + ", buyerVerificationToken: " + buyerVerificationToken)
      document.getElementById('success-msg').style.visibility = 'visible';
      document.getElementById('payment-form').style.visibility = 'hidden';
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
  
    render() {
      return (
        <div id="payment-form">
          <h1>Payment Details (current cost: $30)</h1>
  
          <SquarePaymentForm
            sandbox={true}
            applicationId={process.env.REACT_APP_SANDBOX_APPLICATION_ID}
            locationId={process.env.REACT_APP_SANDBOX_LOCATION_ID}
            cardNonceResponseReceived={this.cardNonceResponseReceived}
            createVerificationDetails={this.createVerificationDetails}
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
          Pay $30.00
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
