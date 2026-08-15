export interface OrderData {
    productName: string;
    price: number;
    customerName: string;
    phone: string;
    address: string;
}

// REPLACE THIS URL WITH YOUR DEPLOYED GOOGLE SCRIPT URL
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE';

export const submitOrder = async (order: OrderData) => {
    try {
        if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE') {
            console.warn('Google Script URL not configured yet.');
            // Simulate success for demo purposes if URL is not set
            return { success: true, message: 'Simulated order placement (Set up Google Sheet to make it real!)' };
        }

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order),
        });

        return { success: true };
    } catch (error) {
        console.error('Error submitting order:', error);
        return { success: false, error };
    }
};
