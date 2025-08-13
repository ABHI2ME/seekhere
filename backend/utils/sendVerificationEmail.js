import dotenv from 'dotenv' ;
import transporter from '../libs/mail.js';
import { verificationCodeEmailTemplate } from '../libs/emailTemplates/verificationCodeHtml.js';
dotenv.config() ;
const sendEmailVerificationCode = (code ,  email) => {
    
    (async () => {
  const info = await transporter.sendMail({
    from: process.env.GMAIL_USE,
    to: `${email}`,
    subject: "verify your account",
    text: `verify your email`, // plain‑text body
    html: verificationCodeEmailTemplate(code) // HTML body
  });

  console.log("Message sent:", info.messageId);
  })();

}

export default sendEmailVerificationCode ;