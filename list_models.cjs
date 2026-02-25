const https = require('https');
const apiKey = 'AIzaSyDn4HYVq2h5EvLg8QL3bpCMFG-7O0cxUnU';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                json.models.forEach(m => console.log(m.name));
            } else {
                console.log('No models found or error:', data);
            }
        } catch (e) {
            console.log('Parse error:', e.message);
            console.log('Raw data:', data);
        }
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
