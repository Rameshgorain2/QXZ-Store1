// api/createOrder.js
const axios = require('axios');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        // This tells Cashfree to send the user back to your website with "?payment=success" in the link
        const host = req.headers.host;
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const returnUrl = `${protocol}://${host}/?payment=success`; 

        const orderData = {
            order_id: "QXZ_" + Date.now(),
            order_amount: 299.00, // Price of your App
            order_currency: "INR",
            customer_details: {
                customer_id: req.body.customerId, // This comes from your Firebase!
                customer_name: req.body.name,
                customer_email: req.body.email,
                customer_phone: req.body.phone
            },
            order_meta: {
                return_url: returnUrl // Redirects them to the Success Page!
            }
        };

        const response = await axios.post("https://sandbox.cashfree.com/pg/orders", orderData, {
            headers: {
                'x-api-version': '2023-08-01',
                // Vercel Environment Variables (Safe!)
                'x-client-id': process.env.CASHFREE_APP_ID, 
                'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({ payment_session_id: response.data.payment_session_id });

    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
}
