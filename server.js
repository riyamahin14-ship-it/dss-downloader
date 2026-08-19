const express = require('express');
const path = require('path');
const app = express();

// 1. স্ট্যাটিক ফাইল সেটআপ (CSS/Image/JS এর জন্য)
app.use(express.static(__dirname));

// 2. হোম পেজ রুট
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. 🔥 এই দুটি লাইন যোগ করুন (আপনার অন্য পেজগুলোর জন্য) 🔥
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// (যদি আপনার আরও পেজ থাকে, যেমন /about, তাহলে সেগুলোর জন্যও এভাবে লিখবেন)

// 4. সার্ভার চালু করা
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
