"use strict";

const nodemailer = require("nodemailer");

/**
 * Send email with Ethereal mail service
 *
 * @function
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {string} - Returns message URL
 */
exports.testmailer = async (req, res) => {
  // Setup CORS
  res.set(`Access-Control-Allow-Origin`, `*`); // Obviously, lock down domain(s) as you wish
  res.set(`Access-Control-Allow-Headers`, `Content-Type, Origin, Accept`);
  res.set(`Content-Type`, `application/json`);

  if (req.method === `OPTIONS`) {
    res.set(`Access-Control-Allow-Methods`, `GET`);
    res.set(`Access-Control-Max-Age`, `0`);
    res.status(204).send(``);
  } else {
    // Require POST method
    if (req.method !== `POST`)
      res.status(400).send({
        body: JSON.stringify(`This endpoint requires using the POST method!`),
      });

    const SENDER_NAME = req.body.senderName;
    const SENDER_EMAIL = req.body.senderEmail;
    const RECIPIENT_NAME = req.body.recipientName;
    const RECIPIENT_EMAIL = req.body.recipientEmail;
    const SUBJECT = req.body.subject;
    const TEXT = req.body.text;
    const HTML = req.body.html;

    // Require parameters
    if (
      !SENDER_NAME ||
      !SENDER_EMAIL ||
      !RECIPIENT_NAME ||
      !RECIPIENT_EMAIL ||
      !SUBJECT ||
      !TEXT ||
      !HTML
    ) {
      res.status(400).send({
        body: JSON.stringify(
          `Missing one or more of required parameters: 'senderName', 'senderEmail', 'recipientName', 'recipientEmail', 'subject', 'text' and/or 'html'!`
        ),
      });
    }

    const TEST_ACCOUNT = await nodemailer.createTestAccount();

    const MAIL_TRANSPORT = nodemailer.createTransport({
      host: `smtp.ethereal.email`,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: TEST_ACCOUNT.user,
        pass: TEST_ACCOUNT.pass,
      },
    });

    const MESSAGE = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: `${RECIPIENT_NAME} <${RECIPIENT_EMAIL}>`,
      subject: SUBJECT,
      text: TEXT,
      html: HTML,
    };

    // Attempt to send the email
    try {
      let messageUrl = null;

      await MAIL_TRANSPORT.sendMail(MESSAGE, (error, info) => {
        if (error) {
          console.error(`Error occurred`, error.message);
          return process.exit(1);
        }

        console.log(`Message sent successfully!`);

        messageUrl = nodemailer.getTestMessageUrl(info);

        console.log(`Message available at ${messageUrl}`);

        res.status(200).send({
          body: JSON.stringify(messageUrl),
        });
      });
    } catch (error) {
      console.error(error);

      res.status(400).send({
        body: JSON.stringify(`Error sending the email!`, error),
      });
    }
  }
};
