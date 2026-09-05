const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const SibApiV3Sdk = require('@getbrevo/brevo');


const app = express();
app.use(cors());
app.use(express.json());

// ── Connect to MongoDB ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => console.log('❌ MongoDB error:', err));

// ── Registration Model ──
const registrationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  level:     { type: String, required: true },
  market:    { type: String },
  date:      { type: Date, default: Date.now }
});
const Registration = mongoose.model('Registration', registrationSchema);

// ── Brevo API Setup ──
const brevoClient = SibApiV3Sdk.ApiClient.instance;
brevoClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ── Test Route ──
app.get('/', (req, res) => {
  res.json({ message: '🚀 TradeAcademy backend is running!' });
});

// ── Registration Route ──
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, level, market } = req.body;

  // Check required fields
  if (!firstName || !lastName || !email || !level) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // Save to database
    const newUser = new Registration({ firstName, lastName, email, level, market });
    await newUser.save();

    // Send confirmation email via Brevo API
    await transactionalApi.sendTransacEmail({
      sender: { name: 'TradeAcademy', email: 'diallomamadouyassne@gmail.com' },
      to: [{ email: email }],
      subject: '🚀 Welcome to TradeAcademy!',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#080c10;color:#e8edf3;padding:40px;border-radius:12px;">
          <h1 style="color:#f0c040;font-size:32px;">Welcome ${firstName}! 🎉</h1>
          <p style="color:#6b8099;">You are now registered on <strong style="color:#f0c040;">TradeAcademy</strong>.</p>
          <p style="color:#6b8099;">You will receive trading tips, new lessons and market insights directly in your inbox.</p>
          <div style="background:#141c26;border:1px solid #1e2d3e;border-radius:8px;padding:20px;margin:24px 0;">
            <p style="margin:0;color:#6b8099;">Level : <strong style="color:#e8edf3;">${level}</strong></p>
            <p style="margin:8px 0 0;color:#6b8099;">Preferred Market : <strong style="color:#e8edf3;">${market || 'Not specified'}</strong></p>
          </div>
          <p style="color:#6b8099;font-size:13px;">Happy Trading 🚀</p>
          <p style="color:#f0c040;font-weight:bold;">— The TradeAcademy Team</p>
          <hr style="border-color:#1e2d3e;margin-top:32px;"/>
          <p style="color:#6b8099;font-size:11px;">⚠️ This site is for educational purposes only. Nothing here constitutes financial advice.</p>
        </div>
      `
    });

    res.status(201).json({ message: '✅ Registration successful! Email sent.' });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: '❌ This email is already registered.' });
    }
    console.error(err);
    res.status(500).json({ error: '❌ Server error.' });
  }
});

// ── Start Server ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});