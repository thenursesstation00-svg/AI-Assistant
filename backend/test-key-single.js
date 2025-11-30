const https = require('https');

const key = 'sk-ant-api03-your-key-here';

const data = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 50,
    messages: [{ role: 'user', content: 'Say API key is valid' }]
});

const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🔍 Testing API key...\n');

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => responseData += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const result = JSON.parse(responseData);
            console.log('✅ SUCCESS! API Key is VALID');
            console.log('Response:', result.content[0].text);
        } else {
            console.log('❌ FAILED - Status:', res.statusCode);
            console.log('Response:', responseData);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ ERROR:', error.message);
});

req.write(data);
req.end();
