# 📧 Guide de Configuration Resend

Guide complet pour configurer Resend et tester l'envoi d'emails.

---

## 🎯 Étape 1 : Obtenir Votre Clé API

### 1.1 Créer un Compte Resend

Si ce n'est pas déjà fait :
1. Allez sur https://resend.com
2. Créez un compte gratuit
3. Vérifiez votre email

### 1.2 Créer une Clé API

1. Connectez-vous à https://resend.com
2. Allez dans **API Keys** : https://resend.com/api-keys
3. Cliquez sur **"Create API Key"**
4. Donnez un nom à votre clé (ex: `TalentyLabs Dev`)
5. Sélectionnez les permissions :
   - ✅ **Sending access** (requis)
   - ✅ **Full access** (recommandé pour le dev)
6. Cliquez sur **Create**
7. **⚠️ IMPORTANT** : Copiez la clé immédiatement (elle commence par `re_`)

**Exemple de clé :**
```
re_123abc456def789ghi012jkl345mno678pqr
```

---

## ⚙️ Étape 2 : Configuration de Votre Projet

### 2.1 Installer les Dépendances

```bash
cd influencer-crm
npm install resend dotenv
```

### 2.2 Configurer les Variables d'Environnement

Créez ou modifiez votre fichier `.env` :

```bash
# Copier l'exemple
cp .env.example .env

# Éditer le fichier
nano .env
```

Ajoutez vos informations :

```env
# ============================================
# RESEND (Envoi d'emails)
# ============================================

# Collez votre clé API ici
RESEND_API_KEY=re_votre_cle_api_ici

# Pour le développement, utilisez l'email de test Resend
RESEND_FROM_EMAIL=onboarding@resend.dev

# URL de votre application
APP_URL=http://localhost:3000
```

**⚠️ Important :**
- Remplacez `re_votre_cle_api_ici` par votre vraie clé API
- En développement, utilisez `onboarding@resend.dev` (gratuit, 100 emails/jour)
- En production, utilisez votre propre domaine (voir Étape 4)

---

## 🧪 Étape 3 : Tester l'Envoi d'Email

### 3.1 Lancer le Script de Test

```bash
# Remplacez par VOTRE email personnel
npx tsx scripts/test-resend.ts votre-email@example.com
```

**Exemple :**
```bash
npx tsx scripts/test-resend.ts john.doe@gmail.com
```

### 3.2 Vérifier le Résultat

Si tout fonctionne, vous devriez voir :

```
🚀 Test d'envoi d'email via Resend

📋 Configuration :
   RESEND_API_KEY : ✅ Définie
   RESEND_FROM_EMAIL : onboarding@resend.dev
   Destinataire : votre-email@example.com

📤 Envoi de l'email de test...

✅ Email envoyé avec succès !
   ID du message : abc123-def456
   Destinataire : votre-email@example.com

🎉 Configuration Resend validée !
```

### 3.3 Vérifier Votre Boîte de Réception

1. Ouvrez votre boîte email
2. Cherchez un email avec le sujet **"Test Resend - TalentyLabs"**
3. **⚠️ Vérifiez aussi vos spams !**

### 3.4 Consulter les Logs Resend

1. Allez sur https://resend.com/logs
2. Vous devriez voir votre email de test avec le statut **"Delivered"**

**Statuts possibles :**
- 🟢 **Delivered** : Email bien reçu
- 🟡 **Queued** : En attente d'envoi
- 🔴 **Failed** : Échec de l'envoi

---

## 🐛 Dépannage

### Problème : "RESEND_API_KEY manquante"

**Solution :**
```bash
# Vérifier que .env existe
ls -la .env

# Vérifier le contenu
cat .env | grep RESEND_API_KEY
```

Si la clé n'est pas définie :
1. Ouvrez `.env`
2. Ajoutez : `RESEND_API_KEY=re_votre_cle`
3. Relancez le test

---

### Problème : "Error: Invalid API key"

**Causes possibles :**
1. Clé API incorrecte ou incomplète
2. Clé API expirée ou révoquée
3. Espaces avant/après la clé

**Solution :**
```bash
# Vérifier la clé dans .env
cat .env | grep RESEND_API_KEY

# La clé doit commencer par "re_" et ne pas avoir d'espaces
# Bon : RESEND_API_KEY=re_abc123
# Mauvais : RESEND_API_KEY= re_abc123 
```

Recréez une nouvelle clé API si nécessaire :
1. https://resend.com/api-keys
2. Créez une nouvelle clé
3. Remplacez dans `.env`

---

### Problème : "Email not delivered" ou dans les spams

**Solutions :**

1. **Vérifiez votre boîte spam/courrier indésirable**

2. **Utilisez l'email de test Resend :**
   ```env
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

3. **Vérifiez les logs Resend :**
   - https://resend.com/logs
   - Cliquez sur l'email pour voir les détails

4. **Testez avec un autre email :**
   ```bash
   npx tsx scripts/test-resend.ts autre-email@gmail.com
   ```

---

### Problème : "Rate limit exceeded"

**Causes :**
- Vous avez dépassé le quota (gratuit : 100 emails/jour)

**Solutions :**
1. Attendez 24h
2. Ou passez au plan payant : https://resend.com/pricing
3. Consultez votre usage : https://resend.com/overview

---

## 🚀 Étape 4 : Configuration Production (Optionnel)

Pour utiliser votre propre domaine en production (ex: `noreply@votredomaine.com`) :

### 4.1 Ajouter Votre Domaine

1. Allez sur https://resend.com/domains
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine (ex: `votredomaine.com`)

### 4.2 Configurer les DNS

Resend vous donnera des enregistrements DNS à ajouter :

**Exemple :**
```
Type    Name                   Value
TXT     @                      resend-domain-verification=abc123...
TXT     resend._domainkey      v=DKIM1; k=rsa; p=MIGfMA0GCSq...
TXT     @                      v=spf1 include:resend.com ~all
```

### 4.3 Ajouter les Enregistrements DNS

**Chez votre hébergeur (ex: OVH, Cloudflare, etc.) :**
1. Allez dans la gestion DNS
2. Ajoutez les 3 enregistrements TXT fournis par Resend
3. Sauvegardez

### 4.4 Vérifier le Domaine

1. Retournez sur https://resend.com/domains
2. Cliquez sur **"Verify"** à côté de votre domaine
3. Attendez quelques minutes (propagation DNS)

**Statut :**
- 🟢 **Verified** : Domaine validé, prêt à envoyer
- 🟡 **Pending** : En attente de vérification DNS

### 4.5 Utiliser Votre Domaine

Une fois vérifié, mettez à jour `.env` :

```env
# Production
RESEND_FROM_EMAIL=noreply@votredomaine.com
APP_URL=https://votreapp.com
```

Relancez le test :
```bash
npx tsx scripts/test-resend.ts votre-email@example.com
```

---

## 📊 Limites et Quotas

### Plan Gratuit
- ✅ 3,000 emails/mois
- ✅ 100 emails/jour
- ✅ API complète
- ❌ Pas de domaine custom (seulement onboarding@resend.dev)

### Plan Payant (à partir de $20/mois)
- ✅ 50,000 emails/mois
- ✅ Domaines customs illimités
- ✅ Support prioritaire
- ✅ Analytics avancés

**Voir les prix :** https://resend.com/pricing

---

## ✅ Checklist de Validation

Avant de continuer l'implémentation, vérifiez :

- [ ] Compte Resend créé
- [ ] Clé API obtenue et copiée
- [ ] `.env` configuré avec `RESEND_API_KEY`
- [ ] `.env` configuré avec `RESEND_FROM_EMAIL`
- [ ] `npm install resend` exécuté
- [ ] Script de test réussi (`npx tsx scripts/test-resend.ts`)
- [ ] Email de test reçu dans votre boîte
- [ ] Logs visibles sur https://resend.com/logs
- [ ] (Optionnel) Domaine custom vérifié pour la production

---

## 🎯 Prochaines Étapes

Maintenant que Resend est configuré :

1. **Implémenter le système de collaborateurs**
   ```bash
   # Suivre le plan d'implémentation
   cat docs/COLLABORATORS_IMPLEMENTATION_PLAN.md
   ```

2. **Créer le service d'email**
   ```bash
   # Créer src/lib/email-service.ts (voir IMPLEMENTATION_PLAN Phase 3)
   ```

3. **Tester le flow d'invitation complet**
   - Créer une invitation
   - Recevoir l'email
   - Accepter l'invitation
   - Se connecter

---

## 📞 Support

### Documentation Resend
- Docs officielles : https://resend.com/docs
- API Reference : https://resend.com/docs/api-reference
- SDK Node.js : https://resend.com/docs/send-with-nodejs

### Problèmes Courants
- FAQ : https://resend.com/docs/faq
- Status : https://status.resend.com
- Support : support@resend.com

### Community
- Discord : https://resend.com/discord
- GitHub : https://github.com/resendlabs/resend-node

---

**Vous êtes prêt ! 🎉**

Une fois le test validé, passez à l'implémentation du système de collaborateurs en suivant `COLLABORATORS_IMPLEMENTATION_PLAN.md`.
