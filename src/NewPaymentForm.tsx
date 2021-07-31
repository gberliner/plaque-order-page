import React, { ChangeEvent } from 'react'
import {SquarePaymentsForm,CreditCardInput,} from 'react-square-web-payments-sdk';
import {TokenResult} from '@square/web-sdk'
import {Accordion, AccordionDetails, AccordionSummary,TextField, Dialog, DialogContent, Button} from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons';
import {Alert,Color} from '@material-ui/lab';
import { DialogActions, LinearProgress } from '@material-ui/core';

const applicationId = process.env.REACT_APP_APPLICATION_ID
const locationId = process.env.REACT_APP_LOCATION_ID;
type VendorErrors =  { [k in string]: any  }[]
type PymtStatusObj = {
    orderId?: string;
    price?: number;
    date?: Date;
    vendorInfo?: string;
    error?: string;
    errors?: VendorErrors;
    reason?: string;
}
type NewPaymentFormProps = {
    resetForm: (success:boolean)=>void;
    validationError: boolean;
    validationErrorMsg: string;
}

type PaymentStatus = "unpaid"|"error"|"paid"

type NewPaymentFormState = {
    price: number;
    pymtStatus: PaymentStatus;
    alertText: string;
    badPhoneNo: boolean;
    phoneNoErrorText: string;
    badZip: boolean;
    zipErrorText: string;
}

enum statusEnum {
    FAILED,SUCCESS
}
let statusNames = ['FAILED','SUCCESS']

export class NewPaymentForm extends React.Component<NewPaymentFormProps,NewPaymentFormState> {
    constructor(props: NewPaymentFormProps) {
        super(props);
        this.state = {
            price: 9999,
            alertText: this.props.validationError?this.props.validationErrorMsg:"some problem or other",
            pymtStatus: 'unpaid',
            badPhoneNo: false,
            phoneNoErrorText: 'required',
            badZip: false,
            zipErrorText: 'required'
        }
        
        
        
        if (this.props.validationError) {
            this.setState({
                alertText: "Address not found in Brooklyn, please try again"
            })

        }
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
        if (undefined !== rcptObj.errors) {
            let vendorinfo = JSON.stringify(rcptObj?.errors).substring(0,100);
            let detail = rcptObj?.errors[0].hasOwnProperty("detail")?(rcptObj?.errors[0]?.detail):"unknown";
            const apologyText = `Oops! This is embarrassing. Something went wrong processing your payment. Perhaps you entered the wrong card info? Or maybe there was a glitch on our end. Here's the detail message we got back: ${detail}. If you think the mistake was on our end, you can contact us at treasurer@brooklyn-neighborhood.org, and we can try and help you iron out the problem. (payment processor info: ${vendorinfo} )`

            return apologyText;
        }
        return rcptText;
    }

    async cardTokenizeResponseReceived(tokenObj: TokenResult) {
        let address = (document.getElementById('addr-value') as HTMLInputElement)?.value;
        let email = (document.getElementById('eml') as HTMLInputElement)?.value;
        let success = true;
        let year = (document.getElementById('plaque-year') as HTMLInputElement)?.value;
        let customwords = (document.getElementById('plaque-optional-text') as HTMLInputElement)?.value;
        let phone = (document.getElementById('phone') as HTMLInputElement)?.value;
        let firstname = (document.getElementById('buyerFirstName') as HTMLInputElement).value
        let lastname = (document.getElementById('buyerLastName') as HTMLInputElement).value

        let payload = {
            nonce: tokenObj.token,
            address,
            email,
            year,
            customwords,
            phone,
            firstname,
            lastname
        }
        try {
            let rcpt = await fetch('/api/process-payment',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            })
            if (rcpt.status > 299) {
                success = false;
            }    
            rcpt.text().then(res => {
                try {
                    let rcptObj = JSON.parse(res);

                    if (undefined !== rcptObj?.errors?.detail) {
                        rcptObj["detail"] = rcptObj?.errors?.detail;
                    }
                    this.setState({
                        pymtStatus: success?"paid":"error",
                        alertText: this.formatStatus(rcptObj)
                    })
                    this.props.resetForm(true)
                } catch (error) {
                    try {
                        let errorObj = JSON.parse(error);
                        if (errorObj.hasOwnProperty("detail")) {
                            this.setState({
                                pymtStatus: 'error',
                                alertText: `Payment processing failed with message: ${errorObj?.detail}`
                            })
                        }
                        this.setState({
                            pymtStatus: "error",
                            alertText: "Unexpected response from server! Sorry, maybe it's a network or other hardware issue. Please try again later"              
                        })
                    } catch (error) {
                        this.setState(
                            {
                                pymtStatus: "error",
                                alertText: "Unexpected response from server! Sorry, maybe it's a temporary network glitch. Please try later."
                            }
                        )
                    }

                }
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
        if (this.props.validationError || this?.state?.pymtStatus === 'paid' || this?.state?.pymtStatus === 'error') {
            let colorstatus: Color;
            colorstatus = ((this.props.validationError)?'error':'success')
            if (this.state === null || this.state.alertText === undefined) {
                return( //still waitin for it to come around on the guitar
                    <LinearProgress></LinearProgress>
                )
            }
            if (this.props.validationError && this.state.alertText === null || this.state.alertText === undefined) {
                return (
                    <LinearProgress></LinearProgress>
                )
            }
            if (this.state !== null && this.state.pymtStatus !== null) {
                colorstatus = ((this.state.pymtStatus==='paid')?'success':'error');
            }
            if (this.state.pymtStatus === 'paid') {
                return(
                <Dialog open={true}>
                <DialogContent>
                    <Alert color={colorstatus}>
                        {this.state.alertText}
                    </Alert>
                </DialogContent></Dialog>)
            }
            return( 
                <div>
                    <br></br>
                    <br></br>
                    <br></br>    
                    <Dialog open={this.props.validationError || this.state.pymtStatus !== 'unpaid'}>
                        <DialogContent>
                            <Alert color={colorstatus}>
                                {this.state.alertText}
                            </Alert>
                        </DialogContent>
                        <DialogActions>
                            <Button 
                            onClick={(event)=>{
                                this.props.resetForm(this.state.pymtStatus==='paid'?true:false);
                                this.setState({
                                    pymtStatus: 'unpaid' // rewind back to the beginning
                                })
                            }} 
                            color="primary">
                                Cancel
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                )
        }
        return (
                <div id="plaque-payment-form">
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
                                    inputProps={{
                                        maxLength: 50
                                    }}
                                    variant="filled"
                                    onClick={()=>{
                                        (document.getElementById('card-container') as HTMLDivElement).style.visibility = 'visible'            
                                    }}
                                    helperText="Required">
                                </TextField>

                                <TextField
                                    id="buyerLastName"
                                    label="Last name"
                                    inputProps={{
                                        maxLength: 50
                                    }}
                                    variant="filled"
                                    helperText="Required">
                                </TextField>
                            </fieldset>
                            <fieldset id="billing-address">
                                <TextField
                                    id="billing-street-address"
                                    label="Billing street address"
                                    inputProps={{
                                        maxLength: 50
                                    }}
                                    variant="filled"
                                    helperText="Required">
                                </TextField>

                                <TextField
                                    id="city"
                                    label="City"
                                    inputProps={{
                                        maxLength: 50
                                    }}
                                    helperText="Required"
                                    variant="filled">
                                </TextField>
                                <TextField
                                    id="state"
                                    label="State"
                                    inputProps={{
                                        maxLength: 2
                                    }}
                                    variant="filled"
                                    helperText="Required">
                                </TextField>
                                <TextField
                                    id="zipcode"
                                    label="Zip code"
                                    inputProps={{
                                        maxLength: 5
                                    }}
                                    onChange={(event)=>{
                                        if (!this.state.badZip && event.currentTarget.value.match(/^\d+$/)===null) {
                                            this.setState({
                                                badZip: true,
                                                zipErrorText: "must be numeric"
                                            })
                                            let payform = (document.getElementById('sqpayform') as HTMLFormElement); 
                                            payform.style.visibility = 'hidden'
                                        } else if (this.state.badPhoneNo && event.currentTarget.value.match(/^\d+$/)!==null) {
                                            this.setState({
                                                badZip: false,
                                                zipErrorText: "required"
                                            })
                                            let payform = (document.getElementById('sqpayform') as HTMLFormElement); 
                                            payform.style.visibility = 'visible'
                                       }
                                   }}

                                    variant="filled"
                                    helperText={this.state.zipErrorText}>
                                </TextField>
                                <TextField
                                    id="phone"
                                    label="Phone"
                                    variant="filled"
                                    inputProps={{
                                        maxLength: 10
                                    }}
                                    error={this.state.badPhoneNo}
                                    onChange={(event)=>{
                                         if (!this.state.badPhoneNo && event.currentTarget.value.match(/^\d+$/)===null) {
                                             this.setState({
                                                 badPhoneNo: true,
                                                 phoneNoErrorText: "must be numeric"
                                             })
                                             let payform = (document.getElementById('sqpayform') as HTMLFormElement); 
                                             payform.style.visibility = 'hidden'
                                        } else if (this.state.badPhoneNo && event.currentTarget.value.match(/^\d+$/)!==null) {
                                             this.setState({
                                                 badPhoneNo: false,
                                                 phoneNoErrorText: "required"
                                             })
                                             let payform = (document.getElementById('sqpayform') as HTMLFormElement); 
                                             payform.style.visibility = 'visible'
                                        }
                                    }}
                                    helperText={this.state.phoneNoErrorText}>
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
                                formId="sqpayform"
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
