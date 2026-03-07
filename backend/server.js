const express = require('express');
const app = express();

app.get('/users', (req, res) => {
    res.json({
        status: "Backend Internal Active",
        port: 8081,
        message: "Sistem pemantau jaringan berjalan normal",
        owner: "Ahmad Hafizh Rafii"
    });
});

app.listen(8081, '0.0.0.0', () => {
    console.log('Status Service running on 8081');
});
