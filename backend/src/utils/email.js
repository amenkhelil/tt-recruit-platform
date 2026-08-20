const transporter = require('../config/mailer');
const env = require('../config/env');

const BRAND_COLOR = '#5B21B6';

function wrapper(innerHtml) {
  return `
  <div style="font-family: Arial, sans-serif; color:#1a1a2e; max-width:560px; margin:0 auto; padding:32px 24px;">
    <div style="text-align:center; margin-bottom:24px; font-size:20px; font-weight:800; color:${BRAND_COLOR};">
      TT Recruit System
    </div>
    ${innerHtml}
    <hr style="border:none; border-top:1px solid #e5e7eb; margin:32px 0 16px;" />
    <p style="font-size:12px; color:#6b7280; text-align:center;">Cet email est automatique, merci de ne pas y répondre.</p>
  </div>`;
}

async function send({ to, subject, html }) {
  try {
    await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}: ${err.message}`);
    return false;
  }
}

async function sendOtpEmail({ to, fullName, code, purpose }) {
  const title =
    purpose === 'email_verification'
      ? 'Vérification de votre adresse email'
      : 'Réinitialisation de votre mot de passe';

  const html = wrapper(`
    <h2 style="font-size:20px;">${title}</h2>
    <p>Bonjour ${fullName},</p>
    <p>Voici votre code de vérification :</p>
    <div style="text-align:center; margin:24px 0;">
      <span style="display:inline-block; font-size:32px; font-weight:700; letter-spacing:8px; background:#F5F3FF; color:${BRAND_COLOR}; padding:16px 24px; border-radius:12px;">${code}</span>
    </div>
    <p>Ce code expire dans <strong>10 minutes</strong>.</p>
  `);

  const delivered = await send({ to, subject: title, html });

  if (!delivered && env.NODE_ENV !== 'production') {
    console.log(`[DEV] OTP code for ${to} (${purpose}): ${code}`);
  }
}

async function sendNewJobEmail({ to, fullName, jobTitle, location, jobUrl }) {
  const html = wrapper(`
    <h2 style="font-size:20px;">Nouvelle opportunité disponible</h2>
    <p>Bonjour ${fullName},</p>
    <p>Une nouvelle offre vient d'être publiée :</p>
    <div style="background:#F9FAFB; border-radius:12px; padding:16px; margin:16px 0;">
      <p style="margin:4px 0;"><strong>Poste :</strong> ${jobTitle}</p>
      <p style="margin:4px 0;"><strong>Lieu :</strong> ${location}</p>
    </div>
    <div style="text-align:center;">
      <a href="${jobUrl}" style="display:inline-block; background:${BRAND_COLOR}; color:#fff; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600;">Voir l'offre</a>
    </div>
  `);

  await send({ to, subject: `Nouvelle offre : ${jobTitle}`, html });
}

async function sendApplicationStatusEmail({ to, fullName, jobTitle, status }) {
  const labels = {
    shortlisted: { label: 'présélectionnée', color: '#2563EB' },
    accepted: { label: 'acceptée', color: '#16A34A' },
    rejected: { label: 'non retenue', color: '#DC2626' },
  };
  const info = labels[status] || { label: status, color: BRAND_COLOR };

  const html = wrapper(`
    <h2 style="font-size:20px;">Mise à jour de votre candidature</h2>
    <p>Bonjour ${fullName},</p>
    <p>Votre candidature pour le poste <strong>${jobTitle}</strong> a été
      <span style="color:${info.color}; font-weight:700;">${info.label}</span>.
    </p>
  `);

  await send({ to, subject: `Mise à jour de votre candidature - ${jobTitle}`, html });
}

module.exports = { sendOtpEmail, sendNewJobEmail, sendApplicationStatusEmail };