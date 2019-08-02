const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = (email, msg, subject) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
                user: process.env.EMAIL_ADMIN,
                pass: process.env.EMAIL_ADMIN_PASSWORD
            }
        });

    const mailOptions = {
        from: process.env.EMAIL_ADMIN,
        to: email,
        subject: subject || 'Trilliant',
        html: msg
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log('error while sending message: ', err)
        else
          console.log('message was sent to: ', email, info);
    });
}