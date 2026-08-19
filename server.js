const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ইন-মেমোরি কোড ডাটাবেজ
let codeDatabase = {
    "DSS2026": 10,
    "VIP5": 5
};

// ================= ADMIN APIs ================= //

// সব কোডের তালিকা পাওয়ার এপিআই
app.get('/api/admin/codes', (req, res) => {
    try {
        res.status(200).json({ success: true, data: codeDatabase });
    } catch (err) {
        res.status(500).json({ success: false, message: 'সার্ভার সমস্যা!' });
    }
});

// নতুন কোড তৈরি করার এপিআই
app.post('/api/admin/create-code', (req, res) => {
    try {
        const { code, limit } = req.body;
        if (!code || limit === undefined || limit < 0) {
            return res.status(400).json({ success: false, message: 'সঠিক কোড ও লিমিট দিন।' });
        }
        codeDatabase[code] = parseInt(limit);
        res.status(200).json({ success: true, message: 'কোড সফলভাবে সেভ হয়েছে', data: codeDatabase });
    } catch (err) {
        res.status(500).json({ success: false, message: 'সার্ভার সমস্যা!' });
    }
});

// কোড মুছে ফেলার এপিআই
app.delete('/api/admin/delete-code/:code', (req, res) => {
    try {
        const codeToDelete = req.params.code;
        if (codeDatabase.hasOwnProperty(codeToDelete)) {
            delete codeDatabase[codeToDelete];
            return res.status(200).json({ success: true, message: 'কোড মুছে ফেলা হয়েছে' });
        }
        res.status(404).json({ success: false, message: 'কোড পাওয়া যায়নি' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'সার্ভার সমস্যা!' });
    }
});

// ক্লায়েন্ট এপিআই
app.get('/check-limit', (req, res) => {
    const { code } = req.query;
    if (!code || !codeDatabase.hasOwnProperty(code)) {
        return res.status(400).json({ success: false, message: 'অবৈধ কোড!' });
    }
    return res.status(200).json({ success: true, remainingLimit: codeDatabase[code] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
