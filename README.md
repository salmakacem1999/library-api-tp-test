# Library API

API REST de gestion de bibliothèque développée avec Express.js.

## Installation

```bash
npm install
```

## Lancer le serveur

```bash
npm start
```

Le serveur démarre sur le port 3000 par défaut (configurable via la variable d'environnement `PORT`).

## Routes disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/books | Liste tous les livres (filtre: `?available=true`) |
| GET | /api/books/:id | Détail d'un livre |
| POST | /api/books | Ajouter un livre |
| PUT | /api/books/:id | Modifier un livre |
| DELETE | /api/books/:id | Supprimer un livre |
| POST | /api/books/:id/borrow | Emprunter un livre |
| POST | /api/books/:id/return | Retourner un livre |

## Format des requêtes

### Créer un livre (POST /api/books)
```json
{
  "title": "Le Petit Prince",
  "author": "Antoine de Saint-Exupéry",
  "isbn": "9782070612758",
  "year": 1943
}
```

### Emprunter un livre (POST /api/books/:id/borrow)
```json
{
  "borrower": "Jean Dupont"
}
```

## Format des réponses

Succès :
```json
{ "success": true, "data": { ... } }
```

Erreur :
```json
{ "success": false, "error": "message d'erreur" }
```
## Résultats des tests avant correction
Sur 19 tests au total, **5 tests ont échoué**, ce qui nous a permis de détecter 4 bugs dans le code.

#### 1. Filtre `?available=false` ne fonctionne pas : books.controller.js 
-	Le test attendait uniquement les livres non disponibles, mais il a reçu les livres disponibles => books = books.filter((b) => b.available === true) toujours true 

#### 2. Route `/search` inaccessible (2 tests échoués): books.routes.js 
Route /search placée après /:id donc jamais atteinte :
-	l'ordre des routes est mauvais donc on tombe sur /:id en premier et du coup en mettant / search c’est interprèter comme un id. on cherche donc un livre avec l'id "search", on ne le trouve pas => 404

#### 3. Emprunter un livre ne le marque pas comme indisponible : books.controller.js
Après un emprunt, le champ 'available' restait à 'true' au lieu de passer à 'fals' donc le livre est toujours marqué comme disponible

#### 4. Supprimer un livre ne fonctionne pas vraiment: books.model.js 
splice(book, 1)` utilisait l'objet livre au lieu de son index dans le tableau, donc rien n'était supprimé

## Corrections apportées

### src/routes/books.routes.js
Déplacement de la route '/search' avant '/:id' pour qu'elle soit accessible.

### src/controllers/books.controller.js
- Ajout de 'available: false' lors d'un emprunt
- Correction du filtre 'available' pour prendre en compte la valeur du paramètre

### src/models/books.model.js
- Remplacement de 'splice(book, 1)' par 'splice(idx, 1)' pour supprimer le bon élément