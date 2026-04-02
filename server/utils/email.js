const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send notification to admin when a new quote request comes in
const sendQuoteNotificationToAdmin = async (quote) => {
  const eventTypeLabels = {
    wedding: 'Wedding',
    church: 'Church Event',
    corporate: 'Corporate Event',
    birthday: 'Birthday Party',
    community: 'Community Event',
    fundraiser: 'Fundraiser',
    other: 'Other',
  };

  const mailOptions = {
    from: `"Milk & Honey Coffee Cart" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `New Quote Request from ${quote.name} - ${eventTypeLabels[quote.eventType] || quote.eventType}`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf6ee; border: 1px solid #c8a951; border-radius: 12px; overflow: hidden;">
        <div style="background: #3d2b1f; padding: 24px; text-align: center;">
          <h1 style="color: #c8a951; margin: 0; font-size: 24px;">New Quote Request</h1>
          <p style="color: #faf6ee; margin: 8px 0 0; font-size: 14px;">Milk & Honey Coffee Cart</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #3d2b1f; border-bottom: 2px solid #c8a951; padding-bottom: 8px;">Customer Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 140px;"><strong>Name:</strong></td><td style="padding: 8px 0; color: #3d2b1f;">${quote.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td><td style="padding: 8px 0;"><a href="mailto:${quote.email}" style="color: #c8a951;">${quote.email}</a></td></tr>
            ${quote.phone ? `<tr><td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td><td style="padding: 8px 0;"><a href="tel:${quote.phone}" style="color: #c8a951;">${quote.phone}</a></td></tr>` : ''}
          </table>

          <h2 style="color: #3d2b1f; border-bottom: 2px solid #c8a951; padding-bottom: 8px; margin-top: 24px;">Event Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666; width: 140px;"><strong>Event Type:</strong></td><td style="padding: 8px 0; color: #3d2b1f;">${eventTypeLabels[quote.eventType] || quote.eventType}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;"><strong>Event Date:</strong></td><td style="padding: 8px 0; color: #3d2b1f;">${quote.eventDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;"><strong>Guest Count:</strong></td><td style="padding: 8px 0; color: #3d2b1f;">${quote.guestCount}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;"><strong>Location:</strong></td><td style="padding: 8px 0; color: #3d2b1f;">${quote.location}</td></tr>
          </table>

          ${quote.details ? `
          <h2 style="color: #3d2b1f; border-bottom: 2px solid #c8a951; padding-bottom: 8px; margin-top: 24px;">Additional Details</h2>
          <p style="color: #3d2b1f; line-height: 1.6;">${quote.details}</p>
          ` : ''}

          <div style="margin-top: 24px; text-align: center;">
            <a href="mailto:${quote.email}?subject=Milk %26 Honey Coffee Cart - Your Quote Request" style="display: inline-block; background: #c8a951; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reply to Customer</a>
          </div>
        </div>
        <div style="background: #3d2b1f; padding: 16px; text-align: center;">
          <p style="color: #c8a951; margin: 0; font-size: 12px; font-style: italic;">"He brought us to this place and gave us this land flowing with milk & honey" — Deuteronomy 26:9</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent for quote from:', quote.name);
  } catch (error) {
    console.error('Failed to send admin notification email:', error.message);
  }
};

// Send confirmation email to the customer
const sendQuoteConfirmationToCustomer = async (quote) => {
  const eventTypeLabels = {
    wedding: 'Wedding',
    church: 'Church Event',
    corporate: 'Corporate Event',
    birthday: 'Birthday Party',
    community: 'Community Event',
    fundraiser: 'Fundraiser',
    other: 'Other',
  };

  const mailOptions = {
    from: `"Milk & Honey Coffee Cart" <${process.env.EMAIL_USER}>`,
    to: quote.email,
    subject: `Thanks for your quote request, ${quote.name}! - Milk & Honey Coffee Cart`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #faf6ee; border: 1px solid #c8a951; border-radius: 12px; overflow: hidden;">
        <div style="background: #3d2b1f; padding: 24px; text-align: center;">
          <h1 style="color: #c8a951; margin: 0; font-size: 24px;">Milk & Honey Coffee Cart</h1>
          <p style="color: #faf6ee; margin: 8px 0 0; font-size: 14px;">Faith. Coffee. Community.</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #3d2b1f;">Thank you, ${quote.name}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Your quote request has been successfully submitted! We've received your details and we're excited about the possibility of serving at your event.
            Our team will review your information and get back to you within 24-48 hours.
          </p>

          <div style="background: #fff; border: 1px solid #e8dcc8; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h3 style="color: #c8a951; margin-top: 0;">Your Request Summary</h3>
            <p style="margin: 4px 0; color: #555;"><strong>Event Type:</strong> ${eventTypeLabels[quote.eventType] || quote.eventType}</p>
            <p style="margin: 4px 0; color: #555;"><strong>Event Date:</strong> ${quote.eventDate}</p>
            <p style="margin: 4px 0; color: #555;"><strong>Estimated Guests:</strong> ${quote.guestCount}</p>
            <p style="margin: 4px 0; color: #555;"><strong>Location:</strong> ${quote.location}</p>
          </div>

          <p style="color: #555; line-height: 1.6;">
            In the meantime, feel free to check out our menu and follow us on Instagram
            <a href="https://www.instagram.com/milkandhoneycoffeecart/" style="color: #c8a951;">@milkandhoneycoffeecart</a>
            to see us in action!
          </p>

          <p style="color: #555; line-height: 1.6;">
            If you have any questions, don't hesitate to reach out at
            <a href="mailto:${process.env.EMAIL_USER}" style="color: #c8a951;">${process.env.EMAIL_USER}</a>.
          </p>

          <p style="color: #3d2b1f; font-weight: bold; margin-top: 24px;">
            Blessings,<br/>
            The Milk & Honey Coffee Cart Team
          </p>
        </div>
        <div style="background: #3d2b1f; padding: 16px; text-align: center;">
          <p style="color: #c8a951; margin: 0; font-size: 12px; font-style: italic;">"He brought us to this place and gave us this land flowing with milk & honey" — Deuteronomy 26:9</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to customer:', quote.email);
  } catch (error) {
    console.error('Failed to send customer confirmation email:', error.message);
  }
};

module.exports = {
  sendQuoteNotificationToAdmin,
  sendQuoteConfirmationToCustomer,
};
