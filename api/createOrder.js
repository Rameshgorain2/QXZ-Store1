export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        // This tells Cashfree where to redirect after payment
        const host = req.headers.host;
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const returnUrl = `${protocol}://${host}/?payment=success`; 

        const orderData = {
            order_id: "QXZ_" + Date.now(),
            order_amount: 299.00, // Price of your App
            order_currency: "INR",
            customer_details: {
                customer_id: req.body.customerId || "CUST_123", // From Firebase
                customer_name: req.body.name,
                customer_email: req.body.email,
                customer_phone: req.body.phone
            },
            order_meta: {
                return_url: returnUrl 
            }
        };

        // BINA AXIOS KE CASHFREE KO CALL KARNA (Using built-in fetch)
        const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
            method: "POST",
            headers: {
                "x-api-version": "2023-08-01",
                "x-client-id": process.env.CASHFREE_APP_ID, 
                "x-client-secret": process.env.CASHFREE_SECRET_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        // Agar Cashfree se ID mil gayi, toh wapas HTML ko bhej do
        if (data.payment_session_id) {
            res.status(200).json({ payment_session_id: data.payment_session_id });
        } else {
            console.error("Cashfree Error:", data);
            res.status(500).json({ error: "Cashfree API Error", details: data });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
