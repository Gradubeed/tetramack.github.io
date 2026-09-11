import { Resend } from "resend";

let client = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY manquant dans les variables d'environnement.");
  }
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendContactEmail({ to, name, email, message }) {
  const from = process.env.CONTACT_FROM_EMAIL || "Tetra Mack & Co <onboarding@resend.dev>";
  const resend = getClient();
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Nouveau message depuis le site — ${name}`,
    text: `Nom : ${name}\nEmail : ${email}\n\nMessage :\n${message}`,
  });
  if (error) {
    throw new Error(error.message || "Échec de l'envoi de l'e-mail.");
  }
}
