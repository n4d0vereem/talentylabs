# 📋 Migration: To-do List & Documents

## 🎯 Ce qui a été ajouté

### 1. **To-do List par talent** ✅
- Liste de tâches personnalisée pour chaque talent
- Permet au talent manager de suivre les actions à faire
- Fonctionnalités :
  - ✅ Créer des todos avec date d'échéance
  - ✅ Cocher/décocher (completed)
  - ✅ Archiver les todos terminés
  - ✅ Compteur de tâches restantes
- **Persistance en BDD** : Table `talent_todos`

### 2. **Documents illimités** 📄
- Upload de documents pour chaque talent
- Types supportés : PDF, images
- Exemples : Passeport, Carte d'identité, Contrats, etc.
- Fonctionnalités :
  - ✅ Upload illimité de documents
  - ✅ Nommer chaque document
  - ✅ Télécharger les documents
  - ✅ Supprimer les documents
- **Persistance en BDD** : Table `talent_documents`

---

## 🗄️ Structure de la base de données

### Table `talent_documents`
```sql
CREATE TABLE talent_documents (
  id TEXT PRIMARY KEY,
  talent_id TEXT NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Table `talent_todos`
```sql
CREATE TABLE talent_todos (
  id TEXT PRIMARY KEY,
  talent_id TEXT NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  deadline TEXT,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  archived BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

---

## 🚀 Comment appliquer la migration

### Option 1: Migration automatique avec Drizzle (recommandé)

```bash
cd influencer-crm

# Générer la migration
npx drizzle-kit generate:pg

# Appliquer la migration
npx drizzle-kit push:pg
```

### Option 2: Migration manuelle SQL

```bash
# Se connecter à la base de données PostgreSQL
psql -U votre_user -d votre_database

# Exécuter le fichier de migration
\i drizzle/0005_add_documents_and_todos.sql
```

### Option 3: Via l'interface Drizzle Studio

```bash
npx drizzle-kit studio

# Puis exécuter le SQL manuellement dans l'interface
```

---

## 📡 API Endpoints créés

### **To-dos**

#### GET `/api/todos?talentId={id}`
Récupère tous les todos d'un talent

#### POST `/api/todos`
Crée un nouveau todo
```json
{
  "talentId": "string",
  "text": "string",
  "deadline": "YYYY-MM-DD" // optionnel
}
```

#### PATCH `/api/todos`
Met à jour un todo (toggle completed/archived)
```json
{
  "todoId": "string",
  "completed": boolean, // optionnel
  "archived": boolean   // optionnel
}
```

#### DELETE `/api/todos?todoId={id}`
Supprime un todo

---

### **Documents**

#### GET `/api/documents?talentId={id}`
Récupère tous les documents d'un talent

#### POST `/api/documents`
Upload un nouveau document
```json
{
  "talentId": "string",
  "name": "string",
  "fileUrl": "string" // base64
}
```

#### DELETE `/api/documents?documentId={id}`
Supprime un document

---

## 🔧 Fichiers modifiés

1. **Schema BDD** : `src/db/schema.ts`
   - Ajout de `talentDocuments`
   - Ajout de `talentTodos`
   - Relations avec `talents`

2. **API Routes** :
   - `src/app/api/documents/route.ts` (créé)
   - `src/app/api/todos/route.ts` (créé)

3. **API Client** : `src/lib/api-client.ts`
   - Fonctions CRUD pour documents
   - Fonctions CRUD pour todos

4. **Page Profil** : `src/app/(dashboard)/dashboard/creators/[id]/page.tsx`
   - Intégration des todos dans la vue d'ensemble
   - Onglet Documents fonctionnel avec upload

5. **Migration** : `drizzle/0005_add_documents_and_todos.sql`

---

## ✅ Vérification après migration

1. **Vérifier que les tables existent** :
```sql
\dt talent_*
```

Vous devriez voir :
- `talent_documents`
- `talent_todos`

2. **Tester l'application** :
- Aller sur le profil d'un talent
- Créer un todo → vérifier qu'il apparaît après refresh
- Upload un document → vérifier qu'il apparaît après refresh
- Les données persistent en base de données ✅

---

## 🎨 Logique de la To-do List

### **État actuel : Dynamique ET Persistant**

Contrairement à avant où les todos étaient juste en mémoire React, maintenant :

1. **Au chargement** : 
   ```typescript
   const todosData = await getTodos(creatorId);
   setTodos(todosData);
   ```

2. **Création** :
   ```typescript
   const newTodo = await createTodo({
     talentId: creatorId,
     text: "Ma tâche",
     deadline: "2025-12-31"
   });
   setTodos([...todos, newTodo]); // Met à jour le state
   ```

3. **Toggle completed** :
   ```typescript
   await updateTodo(todo.id, { completed: !todo.completed });
   setTodos(todos.map(t => 
     t.id === todo.id ? { ...t, completed: !t.completed } : t
   ));
   ```

4. **Archivage** :
   ```typescript
   await updateTodo(todo.id, { archived: true });
   ```

### **Avantages** :
- ✅ Les données persistent entre les sessions
- ✅ Fonctionne en production
- ✅ Pas de perte de données au refresh
- ✅ Synchronisation automatique
- ✅ Chaque talent a ses propres todos

---

## 🐛 Dépannage

### Erreur : "Table does not exist"
➡️ La migration n'a pas été appliquée. Relancer la migration.

### Les todos/documents ne se sauvegardent pas
➡️ Vérifier que l'API fonctionne :
```bash
# Tester l'API
curl http://localhost:3000/api/todos?talentId=xxx
```

### Base64 trop gros pour les documents
➡️ Pour la production, considérer un stockage externe (S3, Cloudinary, etc.)
➡️ Actuellement les fichiers sont stockés en base64 dans PostgreSQL

---

## 📝 Notes pour la production

1. **Limite de taille** : Les fichiers en base64 peuvent être volumineux. Pour des documents lourds, migrer vers un stockage cloud.

2. **Performance** : Les index ont été ajoutés pour optimiser les requêtes fréquentes.

3. **Sécurité** : Les documents sont liés au talent via foreign key avec `ON DELETE CASCADE`.

4. **Backup** : Penser à inclure ces nouvelles tables dans les backups.

---

Tout est prêt pour la production ! 🚀

