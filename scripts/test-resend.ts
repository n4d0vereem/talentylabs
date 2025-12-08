/**
 * Script de test Resend
 * 
 * Ce script teste l'envoi d'emails via Resend.
 * 
 * Usage : npx tsx scripts/test-resend.ts votre-email@example.com
 */

import { Resend } from 'resend';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResendEmail(recipientEmail: string) {
  console.log('🚀 Test d\'envoi d\'email via Resend\n');
  
  // Vérifier la configuration
  console.log('📋 Configuration :');
  console.log(`   RESEND_API_KEY : ${process.env.RESEND_API_KEY ? '✅ Définie' : '❌ Manquante'}`);
  console.log(`   RESEND_FROM_EMAIL : ${process.env.RESEND_FROM_EMAIL || '❌ Manquante'}`);
  console.log(`   Destinataire : ${recipientEmail}\n`);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ Erreur : RESEND_API_KEY manquante dans .env');
    console.log('\n💡 Comment obtenir votre clé API :');
    console.log('   1. Allez sur https://resend.com/api-keys');
    console.log('   2. Créez une nouvelle clé API');
    console.log('   3. Copiez-la dans votre fichier .env');
    process.exit(1);
  }
  
  if (!process.env.RESEND_FROM_EMAIL) {
    console.error('❌ Erreur : RESEND_FROM_EMAIL manquante dans .env');
    console.log('\n💡 Pour tester rapidement, utilisez :');
    console.log('   RESEND_FROM_EMAIL=onboarding@resend.dev');
    process.exit(1);
  }
  
  // Envoyer l'email de test
  console.log('📤 Envoi de l\'email de test...\n');
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: recipientEmail,
      subject: 'Test Resend - TalentyLabs',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: #000;
                color: #fff;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .success-badge {
                background: #10b981;
                color: white;
                padding: 10px 20px;
                border-radius: 6px;
                display: inline-block;
                font-weight: bold;
                margin: 20px 0;
              }
              .info-box {
                background: #fff;
                border-left: 4px solid #3b82f6;
                padding: 15px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">🎉 TalentyLabs</h1>
              <p style="margin: 10px 0 0 0;">Configuration Resend Réussie</p>
            </div>
            <div class="content">
              <h2>Félicitations !</h2>
              <div class="success-badge">
                ✅ Resend fonctionne parfaitement
              </div>
              <p>
                Si vous recevez cet email, cela signifie que votre configuration Resend est correcte
                et que vous êtes prêt à envoyer des invitations à vos collaborateurs.
              </p>
              
              <div class="info-box">
                <strong>📊 Informations de test :</strong>
                <ul>
                  <li>Email envoyé depuis : <code>${process.env.RESEND_FROM_EMAIL}</code></li>
                  <li>Date : ${new Date().toLocaleString('fr-FR')}</li>
                  <li>Configuration : ✅ Valide</li>
                </ul>
              </div>
              
              <h3>🚀 Prochaines étapes :</h3>
              <ol>
                <li>Implémenter le système de collaborateurs</li>
                <li>Créer votre première invitation</li>
                <li>Tester le flow complet d'invitation</li>
              </ol>
              
              <p>
                <strong>💡 Conseil :</strong> En production, pensez à vérifier votre domaine sur Resend
                pour utiliser votre propre adresse email (ex: noreply@votredomaine.com).
              </p>
            </div>
            <div class="footer">
              <p>Email de test généré automatiquement</p>
              <p>&copy; ${new Date().getFullYear()} TalentyLabs</p>
            </div>
          </body>
        </html>
      `
    });
    
    if (error) {
      console.error('❌ Erreur lors de l\'envoi :', error);
      console.log('\n💡 Problèmes courants :');
      console.log('   - Clé API invalide ou expirée');
      console.log('   - Email d\'envoi non autorisé');
      console.log('   - Quota d\'emails dépassé');
      console.log('\n🔗 Vérifiez les logs : https://resend.com/logs');
      process.exit(1);
    }
    
    console.log('✅ Email envoyé avec succès !');
    console.log(`   ID du message : ${data?.id}`);
    console.log(`   Destinataire : ${recipientEmail}\n`);
    
    console.log('🎉 Configuration Resend validée !\n');
    console.log('📝 Prochaines étapes :');
    console.log('   1. Vérifiez votre boîte de réception');
    console.log('   2. Consultez les logs sur https://resend.com/logs');
    console.log('   3. Commencez l\'implémentation du système de collaborateurs\n');
    
  } catch (error: any) {
    console.error('❌ Erreur inattendue :', error.message);
    console.log('\n🔗 Consultez la documentation : https://resend.com/docs');
    process.exit(1);
  }
}

// Récupérer l'email destinataire depuis les arguments
const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('❌ Erreur : Email destinataire manquant\n');
  console.log('Usage : npx tsx scripts/test-resend.ts votre-email@example.com\n');
  console.log('Exemple :');
  console.log('   npx tsx scripts/test-resend.ts john@example.com');
  process.exit(1);
}

// Valider l'email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(recipientEmail)) {
  console.error('❌ Erreur : Format d\'email invalide\n');
  process.exit(1);
}

// Exécuter le test
testResendEmail(recipientEmail)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
