const https = require('https');

const keys = [
    "sk-ant-api03-your-key-here",
    "sk-ant-api03-your-key-here",
    "sk-ant-api03-your-key-here"
];

const testKey = (key, index) => {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 10,
            messages: [{ role: "user", content: "Hi" }]
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

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => responseData += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ Key ${index + 1}: WORKING (200 OK)`);
                    resolve({ key, valid: true, index });
                } else {
                    console.log(`❌ Key ${index + 1}: INVALID (${res.statusCode})`);
                    resolve({ key, valid: false, index });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Key ${index + 1}: ERROR (${error.message})`);
            resolve({ key, valid: false, index });
        });

        req.write(data);
        req.end();
    });
};

(async () => {
    console.log('🔍 Testing 3 Anthropic API keys...\n');
    
    const results = await Promise.all(keys.map((key, index) => testKey(key, index)));
    const workingKeys = results.filter(r => r.valid).map(r => r.key);
    
    console.log(`\n📊 SUMMARY: ${workingKeys.length}/${keys.length} keys are valid\n`);
    
    if (workingKeys.length > 0) {
        console.log('Valid keys (formatted for .env):');
        console.log(`ANTHROPIC_API_KEYS=${JSON.stringify(workingKeys)}`);
        console.log(`\nANTHROPIC_API_KEY=${workingKeys[0]}`);
    } else {
        console.log('⚠️  No valid keys found. Please check your API keys.');
    }
})();
