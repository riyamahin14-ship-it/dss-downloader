// 1. লাইব্রেরি ইম্পোর্ট করা
const express = require('express');
const path = require('path');

// 2. অ্যাপ তৈরি করা
const app = express();

// 3. হোম পেজ (/) রুট সেট করা - এটি আপনার index.html দেখাবে
app.get('/', (req, res) => {
    // __dirname দিয়ে বর্তমান ফোল্ডার খুঁজে index.html পাঠানো হচ্ছে
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 4. স্ট্যাটিক ফোল্ডার সেট করা (যদি আপনার CSS বা ইমেজ ফোল্ডার থাকে)
// এটি আপনার সব ফাইল সরাসরি ব্রাউজারে দেখানোর জন্য
app.use(express.static(__dirname));

// 5. সার্ভার চালু করা (Render নিজে থেকেই পোর্ট সেট করে দেয়, তাই process.env.PORT ব্যবহার করা জরুরি)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
