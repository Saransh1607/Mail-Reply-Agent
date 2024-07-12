require('dotenv').config()
const nodemailer = require('nodemailer');
const { GMAIL, OUTLOOK } = require("./constants/env");


class MailClient {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL.EMAIL,
                pass: GMAIL.PASSWORD
            }
        });

    }

    async sendMail(to, subject, text, html) {
        const mailOptions = {
            from: GMAIL.EMAIL,
            to,
            subject,
            text,
            html
        }
        
        const sentMail = await this.transporter.sendMail(mailOptions);
        return sentMail;
    }
}

module.exports = MailClient

