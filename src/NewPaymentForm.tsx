import React, {} from 'react'
import {SquarePaymentsForm,CreditCardInput,} from 'react-square-web-payments-sdk';
import {TokenResult} from '@square/web-sdk'
import {Accordion, AccordionDetails, AccordionSummary,TextField} from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons';
import {Alert,Color} from '@material-ui/lab';

const applicationId = process.env.REACT_APP_APPLICATION_ID
const locationId = process.env.REACT_APP_LOCATION_ID;

type PymtStatusObj = {
    orderId?: string;
    price?: number;
    date?: Date;
    vendorInfo?: string;
    error?: string;
    reason?: string;
}
type NewPaymentFormProps = {

}

type PaymentStatus = "unpaid"|"error"|"paid"

type NewPaymentFormState = {
    price: number;
    pymtStatus: PaymentStatus;
    alertText: string;
}

enum statusEnum {
    FAILED,SUCCESS
}
let statusNames = ['FAILED','SUCCESS']

export class NewPaymentForm extends React.Component<NewPaymentFormProps,NewPaymentFormState> {
    constructor(props: NewPaymentFormProps) {
        super(props);
        this.setState({
            price: 9999,
            pymtStatus: "unpaid",
            alertText: ""
        })
        this.cardTokenizeResponseReceived = this.cardTokenizeResponseReceived.bind(this)
        this.formatStatus = this.formatStatus.bind(this);
    }

    componentDidMount() {
        fetch('/api/check-price').then(
            res => {
                res.json().then(pricedata=>
                    this.setState(
                        {
                            price: pricedata.price,
                            pymtStatus: "unpaid"
                        }
                    )
                ).catch(error => {
                    console.error(error.message)
                })
            }
        ).catch(error => {
            console.error(error.message)
        })
    }

    formatStatus(rcptObj: PymtStatusObj) {
        let dateString = new Date(rcptObj.date??Date.now()).toLocaleString();
        let dollarPrice: number = 9999;

        if (rcptObj.hasOwnProperty('price')) {
            dollarPrice= (rcptObj.price !== undefined)?(rcptObj.price/100):9999
        }
        let truncatedVendorString = rcptObj?.vendorInfo?.substring(0,100);
        const rcptText = `Thank you for ordering your historic plaque from the BAC! Your order number is ${rcptObj.orderId}, prepared on ${dateString}. The cost of this order was $ ${dollarPrice}. Please allow time for delivery, because we order them in groups of a minimum of three at a time to get a substantial discount. Encourage your friends and neighbors to get one, too -- this will speed things up! (And please keep these order details handy for future reference. payment processor info: ${truncatedVendorString})`
        const apologyText = `Oops! This is embarrassing. Something went wrong processing your payment. Perhaps you entered the wrong card info? Or maybe there was a glitch on our end. Here's the error message we got back: ${rcptObj.error}, and the reason: ${rcptObj.reason}. If you think the mistake was on our end, you can contact us at treasurer@brooklyn-neighborhood.org, and we can try and help you iron out the problem. (payment processor info: ${rcptObj.vendorInfo})`
        if (undefined !== rcptObj.error) {
            return apologyText;
        }
        return rcptText;
    }

    async cardTokenizeResponseReceived(tokenObj: TokenResult) {
        let address = (document.getElementById('addr-value') as HTMLInputElement)?.value;
        let email = (document.getElementById('eml') as HTMLInputElement)?.value;
        let payload = {
            nonce: tokenObj.token,
            address,
            email
        }
        try {
            let rcpt = await fetch('/api/process-payment',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            })
                
            rcpt.text().then(res => {
                let rcptObj = JSON.parse(res);
                this.setState({
                    pymtStatus: "paid",
                    alertText: this.formatStatus(rcptObj)
                })
                let mapForm = (document.getElementById('map-form') as HTMLDivElement);
                mapForm.style.visibility = 'hidden'
            })
            console.debug('Payment Success');
        } catch(error) {
            let statusObj: PymtStatusObj = {
                error: "payment processing failed",
                reason: JSON.stringify(error),
            }

            this.setState({
                pymtStatus: "error",
                alertText: this.formatStatus(statusObj)
            })
        }

        return;
    }
    render() {
        let price = this?.state?.price;
        if (this?.state?.pymtStatus === 'paid' || this?.state?.pymtStatus === 'error') {
            let colorstatus: Color = this.state.pymtStatus==='paid'?'success':'error';
            return( 
                <div>
                    <br></br>
                    <br></br>
                    <br></br>    
                    <Alert color={colorstatus}>
                        {this.state.alertText}
                    </Alert>
                </div>
                )
        }
        return (<div id="plaque-payment-form">
            <h3>Please provide us with payment details (current cost: ${price})</h3>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-label="Expand"
                    aria-controls="billing-address"
                    id="billing-address-header">
                    Billing address and phone number


                </AccordionSummary>
                <AccordionDetails>
                    <fieldset id="first-and-last-name">
                        <TextField
                            id="buyerFirstName"
                            label="First name"
                            variant="filled"
                            helperText="Required">
                        </TextField>

                        <TextField
                            id="buyerLastName"
                            label="Last name"
                            variant="filled"
                            helperText="Required">
                        </TextField>
                    </fieldset>
                    <fieldset id="billing-address">
                        <TextField
                            id="billing-street-address"
                            label="Billing street address"
                            variant="filled"
                            helperText="Required">
                        </TextField>

                        <TextField
                            id="city"
                            label="City"
                            helperText="Required"
                            variant="filled">
                        </TextField>
                        <TextField
                            id="state"
                            label="State"
                            variant="filled"
                            helperText="Required">
                        </TextField>
                        <TextField
                            id="zipcode"
                            label="Zip code"
                            variant="filled"
                            helperText="Required">
                        </TextField>
                        <TextField
                            id="phone"
                            label="Phone"
                            variant="filled"
                            helperText="Required">
                        </TextField>
                        <TextField
                            id="eml"
                            label="Email"
                            variant="filled"
                            helperText="Required">
                        </TextField>
                    </fieldset>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-label="Expand"
                    aria-controls="sqPaymentForm"
                    id="sqPaymentForm-header">

                    <p>Credit Card Details</p>


                </AccordionSummary>
                <AccordionDetails>

                    <SquarePaymentsForm
                        cardTokenizeResponseReceived={this.cardTokenizeResponseReceived}
                        applicationId={applicationId ?? ""}
                        locationId={locationId ?? ""}>
                        <CreditCardInput />
                    </SquarePaymentsForm>
                </AccordionDetails>
            </Accordion>
            <div id="pymt-status-msg">
                <p id="pymt-status-txt"></p>
            </div>
        </div>)

    }
}
