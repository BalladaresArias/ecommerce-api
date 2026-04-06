const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, template) => {
  try {
    await resend.emails.send({
      from: 'ShopFlow <onboarding@resend.dev>',
      to,
      subject: template.subject,
      html: template.html,
    });
    console.log(`✉️ Email enviado a ${to}`);
  } catch (err) {
    console.error('Error enviando email:', err.message);
  }
};

module.exports = { sendEmail };