const nodemailer = require('nodemailer');

const sendBookingEmail = async (email, serviceType, date, time, address) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,       // yourEmail@gmail.com
      pass: process.env.EMAIL_PASS,       // App password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Taxi Booking Confirmation',
    text: `You have booked ${serviceType} Taxi Service on ${date} at ${time}.\nPickup Address: ${address}.\n\nThank you for booking with us.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Booking email sent successfully');
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

module.exports = sendBookingEmail;
