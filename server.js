const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.static('public'));

let codes = {};

const ADMIN_USERNAME = 'MahinKhan';
const ADMIN_PASSWORD = 'Mahin512@@';

app.get('/check-limit', (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'কোড প্রয়োজন' });
    if (!codes[code]) return res.status(404).json({ error: 'কোড পাওয়া যায়নি' });
    res.json({ remainingLimit: codes[code] });
});

app.post('/download-application', async (req, res) => {
    const { id, code } = req.body;
    if (!id || !code) return res.status(400).json({ error: 'আইডি এবং কোড প্রয়োজন' });
    if (!codes[code]) return res.status(403).json({ error: 'ভুল গোপন কোড!' });
    if (codes[code] <= 0) return res.status(429).json({ error: 'লিমিট শেষ!' });
    try {
        const url = `https://dss.bhata.gov.bd/submitted-application?id=${id}`;
        const response = await axios.get(url, { responseType: 'stream', timeout: 30000 });
        const contentType = response.headers['content-type'] || '';
        if (!contentType.includes('pdf') && !contentType.includes('application')) {
            return res.status(404).json({ error: 'আবেদন পাওয়া যায়নি!' });
        }
        codes[code] -= 1;
        res.setHeader('Content-Disposition', `attachment; filename=Application_${id}.pdf`);
        response.data.pipe(res);
    } catch (error) {
        if (codes[code] !== undefined) codes[code] += 1;
        res.status(500).json({ error: 'সার্ভার সমস্যা!' });
    }
});

function checkAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'লগইন প্রয়োজন' });
    const [user, pass] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) next();
    else res.status(401).json({ error: 'ভুল তথ্য' });
}

app.get('/api/admin/codes', checkAuth, (req, res) => res.json(codes));
app.post('/api/admin/create-code', checkAuth, (req, res) => {
    const { code, limit } = req.body;
    if (!code || !limit || limit < 1) return res.status(400).json({ error: 'সঠিক তথ্য দিন' });
    if (codes[code]) return res.status(400).json({ error: 'কোড আগে থেকেই আছে' });
    codes[code] = parseInt(limit);
    res.json({ success: true });
});
app.delete('/api/admin/delete-code/:code', checkAuth, (req, res) => {
    delete codes[req.params.code];
    res.json({ success: true });
});
app.delete('/api/admin/delete-all-codes', checkAuth, (req, res) => {
    codes = {};
    res.json({ success: true });
});
app.post('/api/admin/update-limit', checkAuth, (req, res) => {
    const { code, limit } = req.body;
    if (!codes[code]) return res.status(404).json({ error: 'কোড নেই' });
    codes[code] = parseInt(limit);
    res.json({ success: true });
});

app.listen(3000, () => console.log('🚀 Server running'));
module.exports = app;
