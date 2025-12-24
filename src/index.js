require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { sendLeadNotification } = require('./email');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Settlo Backend is running!' });
});

// Lead submission endpoint
app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, company, message, demo, source } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !source) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, email, phone, and source are required' 
      });
    }

    // Validate source type
    if (!['contact', 'hero'].includes(source)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Source must be either "contact" or "hero"' 
      });
    }

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company: company || null,
        message: message || null,
        demo: demo || null,
        source
      }
    });

    console.log(`✅ New lead saved: ${lead.name} (${lead.source})`);

    // Send email notification (async, don't wait for it)
    sendLeadNotification(lead).catch(err => {
      console.error('Email notification failed:', err);
    });

    res.status(201).json({ 
      success: true, 
      message: 'Lead submitted successfully!',
      lead: {
        id: lead.id,
        name: lead.name,
        createdAt: lead.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error saving lead:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit lead. Please try again.' 
    });
  }
});

// Get all leads (for admin purposes)
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leads' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║   🚀 Settlo Backend Server                    ║
  ║   Running on: http://localhost:${PORT}          ║
  ║   Database: Neon PostgreSQL                   ║
  ╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
