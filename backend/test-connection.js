const axios = require('axios');

const EXECUTION_API_URL = 'http://54.166.200.6:2000/api/v2/execute';

console.log(`Testing connection to ${EXECUTION_API_URL}...`);

// Piston/Runtoman usually expects a POST with language/source
const payload = {
    language: "python",
    version: "3.10.0",
    files: [{ content: "print('Hello World')" }]
};

axios.post(EXECUTION_API_URL, payload)
    .then(res => {
        console.log("Success!");
        console.log("Status:", res.status);
        console.log("Data:", res.data);
    })
    .catch(err => {
        console.error("Connection Failed!");
        console.error("Message:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        } else if (err.request) {
            console.error("No response received. Possible timeout or network error.");
        }
    });
