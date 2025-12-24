const nodemailer = require('nodemailer');

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send lead notification email
 * @param {Object} lead - Lead data
 */
async function sendLeadNotification(lead) {
  const isContactForm = lead.source === 'contact';
  
  const subject = isContactForm 
    ? `🔔 New Contact Form Submission - ${lead.name}`
    : `🚀 New Demo Request - ${lead.name} (${lead.demo})`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #10b981; }
        .field label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .field p { margin: 5px 0 0; font-size: 16px; color: #1e293b; font-weight: 500; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Lead from Settlo Website</h1>
          <span class="badge">${isContactForm ? 'Contact Form' : 'Demo Request'}</span>
        </div>
        <div class="content">
          <div class="field">
            <label>Full Name</label>
            <p>${lead.name}</p>
          </div>
          <div class="field">
            <label>Email Address</label>
            <p><a href="mailto:${lead.email}">${lead.email}</a></p>
          </div>
          <div class="field">
            <label>Phone Number</label>
            <p><a href="tel:${lead.phone}">${lead.phone}</a></p>
          </div>
          ${lead.company ? `
          <div class="field">
            <label>Company</label>
            <p>${lead.company}</p>
          </div>
          ` : ''}
          ${lead.demo ? `
          <div class="field">
            <label>Demo Requested</label>
            <p>${lead.demo}</p>
          </div>
          ` : ''}
          ${lead.message ? `
          <div class="field">
            <label>Message</label>
            <p>${lead.message}</p>
          </div>
          ` : ''}
          <div class="field">
            <label>Submitted At</label>
            <p>${new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
        <div class="footer">
          This lead was captured from the Settlo website.<br>
          © ${new Date().getFullYear()} Settlo
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Settlo Leads" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: subject,
      html: htmlContent
    });
    console.log('✅ Lead notification email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
}

module.exports = { sendLeadNotification };
