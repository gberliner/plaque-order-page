import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import parser, {OptionsText} from 'body-parser'
import processPayment from './api/paymentRcvd';
import {handlePaymentErrors} from './api/handlePaymentErrors';
import {createPlaqueOrder} from './api/createOrder';
import {checkPrice} from './api/checkPrice';
import { fileURLToPath } from 'url';
import { handleOrderFulfillmentUpdate } from './api/orderFulfillmentUpdate';
//@ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.static(path.join(__dirname, 'build')));

//Note: bypass auto-parsing json for handling the Square webhook "order.fulfillment.update"
//(we will use a custom parser tailored for these messages instead): 
app.use(function(req,res,next) {
	if (!!req.get('X-Square-Signature')) {
		req.headers['content-type'] = 'text/plain';
		(express.text({
			type: '*/*'
		}))(req,res,next)
	}else {
		(express.json()(req,res,next))
	}
})

app.post('/api/order-fulfillment-updated', handleOrderFulfillmentUpdate);
app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.post('/api/process-payment', createPlaqueOrder, processPayment);
app.get('/api/check-price', checkPrice);
app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.get('/*', (request, response) => {
	response.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.use(handlePaymentErrors);
app.listen(process.env.NODE_ENV === "production" ? parseInt(process?.env?.PORT as string): 8080);
