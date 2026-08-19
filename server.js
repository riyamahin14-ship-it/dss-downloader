const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors()); // CORS এরর এড়াতে
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // public ফোল্ডার সার্ভ করবে

// ইন-মেমোরি গোপন কোড ও লিমিট ডাটাবেজ
let codeDatabase = {
    "DSS2026": 10,
    "VIP5": 5
};

// ================= API ENDPOINTS ================= //

// ১. এপিআই: গোপন কোডের অবশিষ্ট লিমিট দেখা
// Endpoint: GET /check-limit?code=YOUR_CODE
app.get('/check-limit', (req, res) => {
    const { code } = req.query;

    if (!code || !codeDatabase.hasOwnProperty(code)) {
        return res.status(400).json({
            success: false,
            message: 'অবৈধ বা ভুল গোপন কোড!'
        });
    }

    return res.status(200).json({
        success: true,
        code: code,
        remainingLimit: codeDatabase[code]
    });
});

// ২. এপিআই: আসল লিঙ্ক গোপন রেখে PDF ডাউনলোড
// Endpoint: POST /download-application
app.post('/download-application', async (req, res) => {
    const { id, code } = req.body || {};

    if (!id || !code) {
        return res.status(400).json({
            success: false,
            message: 'আবেদন আইডি এবং গোপন কোড দুটোই প্রয়োজন।'
        });
    }

    if (!codeDatabase.hasOwnProperty(code)) {
        return res.status(403).json({
            success: false,
            message: 'ভুল গোপন কোড!'
        });
    }

    if (codeDatabase[code] <= 0) {
        return res.status(429).json({
            success: false,
            message: 'এই গোপন কোডের ডাউনলোড লিমিট শেষ হয়ে গেছে!'
        });
    }

    // আপনার দেওয়া আসল ডাইনামিক ইউআরএল (যা ক্লায়েন্ট থেকে সম্পূর্ণ হাইড থাকবে)
    const targetUrl = `https://dss.bhata.gov.bd/submitted-application?id=${id}`;

    try {
        const response = await axios.get(targetUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        // সফল ডাউনলোডে ১ টি লিমিট কমবে
        codeDatabase[code] -= 1;

        // ফাইল হিসেবে ক্লায়েন্টে রেসপন্স পাঠানো
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Application_${id}.pdf`);
        return res.send(response.data);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'মূল সার্ভার থেকে ফাইল পাওয়া যায়নি।'
        });
    }
});

// ================= ADMIN APIs ================= //

// ৩. এপিআই: সব কোডের তালিকা
app.get('/api/admin/codes', (req, res) => {
    res.json(codeDatabase);
});

// ৪. এপিআই: নতুন কোড ও লিমিট যুক্ত করা
app.post('/api/admin/create-code', (req, res) => {
    const { code, limit } = req.body;
    if (!code || limit === undefined || limit < 0) {
        return res.status(400).json({ message: 'সঠিক কোড ও লিমিট দিন।' });
    }
    codeDatabase[code] = parseInt(limit);
    res.json({ message: 'কোড সফলভাবে তৈরি হয়েছে', data: codeDatabase });
});

// Render-এর দেওয়া ডায়নামিক পোর্ট পোর্ট ধরবে
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
