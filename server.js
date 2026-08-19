const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');
const path = require('path');

const app = express();

// CORS সম্পূর্ণ ওপেন করা
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ডাটাবেজ (Default Data)
let codeDatabase = {
    "DSS2026": 10,
    "VIP5": 5
};

// ================= ADMIN APIs ================= //

// সব কোড পাওয়ার API
app.get('/api/admin/codes', (req, res) => {
    return res.status(200).json(codeDatabase);
});

// নতুন কোড যোগ করার API
app.post('/api/admin/create-code', (req, res) => {
    const { code, limit } = req.body || {};
    if (!code || limit === undefined) {
        return res.status(400).json({ error: 'কোড ও লিমিট সঠিক নয়' });
    }
    codeDatabase[code] = parseInt(limit);
    return res.status(200).json({ message: 'সফলভাবে যুক্ত হয়েছে', codes: codeDatabase });
});

// কোড মুছে ফেলার API
app.delete('/api/admin/delete-code/:code', (req, res) => {
    const codeToDelete = req.params.code;
    if (codeDatabase.hasOwnProperty(codeToDelete)) {
        delete codeDatabase[codeToDelete];
        return res.status(200).json({ message: 'মুছে ফেলা হয়েছে' });
    }
    return res.status(404).json({ error: 'কোড পাওয়া যায়নি' });
});

// ================= USER APIs ================= //

app.get('/check-limit', (req, res) => {
    const { code } = req.query;
    if (!code || !codeDatabase.hasOwnProperty(code)) {
        return res.status(400).json({ success: false, message: 'অবৈধ কোড!' });
    }
    return res.status(200).json({ success: true, remainingLimit: codeDatabase[code] });
});

app.post('/download-application', async (req, res) => {
    const { id, code } = req.body || {};
    if (!id || !code || !codeDatabase.hasOwnProperty(code) || codeDatabase[code] <= 0) {
        return res.status(403).json({ success: false, message: 'ভুল বা সীমা শেষ হওয়া কোড!' });
    }

    const targetUrl = `https://dss.bhata.gov.bd/submitted-application?id=${id}`;

    try {
        const response = await axios.get(targetUrl, {
            responseType: 'arraybuffer',
            httpsAgent: httpsAgent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });

        codeDatabase[code] -= 1;
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Application_${id}.pdf`);
        return res.send(response.data);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'সার্ভার থেকে ফাইল আনা যায়নি' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
