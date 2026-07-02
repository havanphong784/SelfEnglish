const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const healthRoutes = require('./routes/health');
const dashboardRoutes = require('./routes/dashboard');
const vocabularyRoutes = require('./routes/vocabulary');
const authRoutes = require('./routes/auth');

app.use('/api/health', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vocabularies', vocabularyRoutes);
app.use('/api/auth', authRoutes);

// Error Handling Middleware
const fs = require('fs');
app.use((err, req, res, next) => {
  // dummy comment for restart 2
  fs.appendFileSync('error.log', new Date().toISOString() + '\\n' + err.stack + '\\n\\n');
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
