const express = require('express');
const cors = require('cors');
require('dotenv').config();
const env = require('./config/env');

const app = express();
const PORT = env.port;

// Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
  if (env.nodeEnv === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS'));
  },
}));
app.use(express.json({ limit: env.jsonLimit }));

// Routes
const healthRoutes = require('./routes/health');
const dashboardRoutes = require('./routes/dashboard');
const vocabularyRoutes = require('./routes/vocabulary');
const authRoutes = require('./routes/auth');

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SelfEnglish backend is running',
    health: '/api/health',
    frontend: 'http://localhost:5173',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vocabularies', vocabularyRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware
const fs = require('fs');
app.use((err, req, res, next) => {
  fs.appendFileSync('error.log', new Date().toISOString() + '\\n' + err.stack + '\\n\\n');
  console.error(err.stack);
  const message = env.nodeEnv === 'production'
    ? 'Something went wrong!'
    : err.message || 'Something went wrong!';
  res.status(500).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
