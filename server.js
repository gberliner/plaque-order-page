import express from 'express';
import path from 'path';
import paymentRcvd from './api/paymentRcvd.js';
import verifyEmail from './api/verifyEmail.js';
const app = express();
app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.post('/api/verify-email', verifyEmail);
app.post('/api/payment-process', paymentRcvd);

app.listen(process.env.EXPRESS_PORT || 8080);
