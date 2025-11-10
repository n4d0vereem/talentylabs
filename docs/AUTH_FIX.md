# Correction du système d'authentification

Date: 5 novembre 2025  
Dernière mise à jour: 5 novembre 2025 - 01:35

## Problème identifié

L'utilisateur était déconnecté immédiatement après la connexion ou l'inscription, empêchant l'accès au dashboard.

### Causes racines

1. **Proxy interfère avec les cookies de session**
   - `src/proxy.ts` vérifie le cookie `better-auth.session_token` avant que la session soit créée
   - Redirige vers `/sign-in` si le cookie n'existe pas, créant une boucle de redirection
   - Le cookie n'est pas encore défini quand on arrive sur `/dashboard` après sign-up/sign-in

2. **Redirections multiples cassent la session**
   - `window.location.href` force un rechargement complet
   - Timeouts artificiels (`setTimeout`) ne garantissent pas que la session est créée
   - Multiples redirections empêchent le cookie de session de se propager

3. **Vérification de session trop agressive**
   - Le dashboard redirige vers `/sign-in` avant que `useSession` ait fini de charger
   - Pas de distinction entre "session en cours de chargement" et "pas de session"

---

## Solutions implémentées

### 1. Suppression du proxy
**Fichier supprimé**: `src/proxy.ts`

Le proxy est remplacé par une gestion d'authentification uniquement côté client avec `useSession` de Better Auth.

### 2. Simplification du flow sign-up
**Fichier**: `src/app/(auth)/sign-up/page.tsx`

**Avant**:
```typescript
await signUp.email({ email, password, name });
await new Promise(resolve => setTimeout(resolve, 500));
await signIn.email({ email, password });
await new Promise(resolve => setTimeout(resolve, 300));
window.location.href = "/dashboard";
```

**Après**:
```typescript
await signUp.email({ email, password, name });
router.push("/dashboard");
```

Better Auth avec `autoSignIn: true` crée automatiquement la session après sign-up.

### 3. Simplification du flow sign-in
**Fichier**: `src/app/(auth)/sign-in/page.tsx`

**Avant**:
```typescript
await signIn.email({ email, password });
await new Promise(resolve => setTimeout(resolve, 300));
window.location.href = "/dashboard";
```

**Après**:
```typescript
await signIn.email({ email, password });
router.push("/dashboard");
```

### 4. Configuration Better Auth améliorée
**Fichier**: `src/lib/auth.ts`

Ajout de:
```typescript
emailAndPassword: {
  autoSignIn: true, // Auto sign-in après sign-up
},
session: {
  expiresIn: 60 * 60 * 24 * 7, // 7 jours
  updateAge: 60 * 60 * 24, // Update toutes les 24h
},
```

### 5. Gestion de session améliorée dans le dashboard
**Fichier**: `src/app/(dashboard)/dashboard/page.tsx`

- Attend que `isPending` soit `false` avant de vérifier la session
- Logs de débogage pour suivre le flow
- Gère les erreurs de manière plus granulaire
- Distingue erreur d'authentification (→ sign-in) et erreur d'agence (→ onboarding)

### 6. Sidebar affiche l'état de chargement
**Fichier**: `src/components/sidebar.tsx`

- Affiche "Chargement..." pendant que la session se charge
- Utilise `isPending` pour savoir si la session est en cours de chargement
- Évite d'afficher "Non connecté" pendant le chargement

---

## Nouveau flow d'authentification

### Sign-up (inscription)
1. Utilisateur remplit le formulaire
2. `signUp.email()` crée le compte + session (avec `autoSignIn`)
3. Redirection vers `/dashboard` avec `router.push()`
4. Dashboard vérifie session et agence
5. Redirection vers `/onboarding` si pas d'agence, sinon affiche dashboard

### Sign-in (connexion)
1. Utilisateur remplit le formulaire
2. `signIn.email()` crée la session
3. Redirection vers `/dashboard` avec `router.push()`
4. Dashboard vérifie session et agence
5. Redirection vers `/onboarding` si pas d'agence, sinon affiche dashboard

### Dashboard
1. Attend que `isPending` soit `false`
2. Si pas de session → redirige vers `/sign-in`
3. Vérifie si l'utilisateur a une agence
4. Si pas d'agence → redirige vers `/onboarding`
5. Charge et affiche les données

### Onboarding
1. Utilisateur crée son agence
2. `createUserAgency()` crée l'agence
3. Redirection vers `/dashboard` avec `router.push()` + `router.refresh()`
4. Dashboard recharge et affiche les données de l'agence

---

## Avantages de la nouvelle approche

✅ **Pas de boucle de redirection** - Le proxy ne redirige plus avant que la session soit créée

✅ **Session persistante** - Better Auth gère les cookies automatiquement

✅ **UX améliorée** - Pas de rechargement complet de la page (`window.location.href`)

✅ **Débogage facile** - Logs clairs pour suivre le flow

✅ **Code plus simple** - Moins de timeouts artificiels et de vérifications multiples

✅ **Fiable** - Better Auth gère la création et la validation de session

---

## Points de vigilance

⚠️ **localStorage pour les settings**
Les settings d'agence sont encore stockés dans `localStorage` et chargés dans le layout. Ceci est géré séparément de l'authentification.

⚠️ **Sessions multiples**
Better Auth gère automatiquement les sessions multiples (plusieurs onglets, appareils).

⚠️ **Déconnexion**
Le bouton de déconnexion appelle `signOut()` qui supprime la session côté serveur et client.

---

## Testing recommandé

1. **Sign-up → Dashboard → Onboarding → Dashboard**
   - Créer un nouveau compte
   - Vérifier redirection vers onboarding
   - Créer une agence
   - Vérifier affichage du dashboard

2. **Sign-in → Dashboard**
   - Se connecter avec un compte existant
   - Vérifier affichage du dashboard si agence existe
   - Vérifier redirection vers onboarding si pas d'agence

3. **Persistence de session**
   - Se connecter
   - Fermer l'onglet
   - Rouvrir l'onglet → devrait rester connecté

4. **Déconnexion**
   - Cliquer sur "Se déconnecter"
   - Vérifier redirection vers `/sign-in`
   - Essayer d'accéder `/dashboard` → devrait rediriger vers `/sign-in`

---

## Corrections finales (5 novembre - 01:35)

### 7. Schéma Better Auth complet
**Tables corrigées**: `accounts` et `sessions`

Ajout du champ `updatedAt` manquant dans les deux tables :
```typescript
// accounts
updatedAt: timestamp("updated_at").defaultNow().notNull(),

// sessions
updatedAt: timestamp("updated_at").defaultNow().notNull(),
```

Better Auth requiert ce champ pour gérer la mise à jour des sessions et comptes.

### 8. Upload de logo dans onboarding
**Fichier**: `src/app/(dashboard)/dashboard/onboarding/page.tsx`

Le bouton shadcn/ui bloquait le comportement du `label`. Correction avec `asChild`:
```tsx
<input type="file" id="logo-upload" className="hidden" />
<label htmlFor="logo-upload">
  <Button asChild>
    <span>Télécharger un logo</span>
  </Button>
</label>
```

### 9. Sidebar propre sur onboarding
**Fichier**: `src/components/sidebar.tsx`

- Ne charge plus les anciens settings d'agence sur la page d'onboarding
- Affiche "TalentyLabs" par défaut au lieu de l'ancien logo
- Cache les menus de navigation et affiche un message d'accueil

```typescript
const isOnboarding = pathname === "/dashboard/onboarding";

useEffect(() => {
  if (!isOnboarding) {
    const settings = getAgencySettings();
    setAgencySettings(settings);
  } else {
    setAgencySettings(null);
  }
}, [pathname, isOnboarding]);
```

---

## Résolution des problèmes

### "Je suis toujours déconnecté"
1. Vérifier que `BETTER_AUTH_SECRET` est défini dans `.env.local`
2. Vérifier que `BETTER_AUTH_URL` et `NEXT_PUBLIC_BETTER_AUTH_URL` sont corrects
3. Vérifier les cookies dans les DevTools (devrait voir `better-auth.session_token`)
4. Vérifier les logs dans la console du navigateur

### "Je ne suis pas redirigé vers onboarding"
1. Vérifier que l'utilisateur n'a pas déjà une agence dans la DB
2. Vérifier les logs dans la console: "No agency, redirecting to onboarding"
3. Vérifier l'API `/api/agency` retourne bien `{ agency: null }`

### "Mon sidebar affiche 'Non connecté'"
1. Attendre quelques secondes (session en cours de chargement)
2. Vérifier les logs: "Session found: [email]"
3. Rafraîchir la page avec F5/Cmd+R

---

## Prochaines étapes possibles

🔄 **Migration des settings vers la DB**
Au lieu de `localStorage`, charger les settings depuis l'API.

🔒 **Protection des routes API**
Ajouter une vérification de session dans toutes les routes API protégées.

📊 **Monitoring de session**
Logger les événements de connexion/déconnexion pour debug.

🎨 **Loading states**
Améliorer les états de chargement dans le dashboard et sidebar.

