import nodemailer from 'nodemailer';

const smtp = {};

const mode = (process.env.SMTP_MODE || '').toLowerCase(); // smtp | sendmail
const useExternal = mode === 'smtp' || !!process.env.SMTP_HOST;
const sendmailPath = process.env.SMTP_SENDMAIL_PATH || '/usr/sbin/sendmail';

smtp.FROM = {
  name: process.env.SMTP_FROM_NAME || 'GFIC',
  email: process.env.SMTP_FROM_EMAIL || 'no-reply@myhost.com'
};

const getTransporter = () => {
  if (useExternal) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || ''
          }
        : undefined
    });
  }

  return nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: sendmailPath
  });
};

const transporter = getTransporter();

smtp.sendMail = async function (obj) {
  if (process.env.IGNORE_EMAILS) {
    return true;
  }

  const fromData = obj.from || smtp.FROM;
  const from =
    fromData && fromData.name && fromData.email
      ? `"${fromData.name}" <${fromData.email}>`
      : fromData?.email || smtp.FROM.email;

  const info = await transporter.sendMail({
    from,
    to: obj.to,
    subject: obj.subject,
    text: obj.text,
    html: obj.html || ''
  });

  return info;
};

export default smtp;
