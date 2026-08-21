export default async function handler(req, res) {
    const order_id = req.query.order_id;
    if (!order_id) return res.status(400).json({ error: "Order ID missing" });

    try {
        // Cashfree se pucho ki payment ka status kya hai
        const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${order_id}`, {
            method: "GET",
            headers: {
                "x-api-version": "2023-08-01",
                "x-client-id": process.env.CASHFREE_APP_ID,
                "x-client-secret": process.env.CASHFREE_SECRET_KEY
            }
        });

        const data = await response.json();
        
        // Return order status ("PAID", "ACTIVE", etc.)
        res.status(200).json({ status: data.order_status });

    } catch (error) {
        res.status(500).json({ error: "Verification Failed" });
    }
}
