// Vercel Serverless Function to proxy Expo Push Notifications
// Avoids CORS issues by sending from server-side

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('Push notification error:', error);
        return res.status(500).json({ error: 'Failed to send push notification' });
    }
}
