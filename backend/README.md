# Ectriborne CRM Backend

API REST pour le système de gestion CRM d'Ectriborne, spécialisé dans les installations électriques et la mobilité électrique.

## 🚀 Fonctionnalités

- **Authentification JWT** avec refresh tokens
- **Gestion multi-rôles** (Admin, Technicien, Client)
- **Gestion des installations** électriques
- **Système de devis** complet
- **Messagerie interne**
- **Intégration Stripe** pour les paiements
- **Rapports conformes BATUTA**
- **Upload d'images** avec Cloudinary
- **Import CSV** pour les techniciens

## 📋 Prérequis

- Node.js >= 18.0.0
- MongoDB >= 5.0
- Compte Stripe (pour les paiements)
- Compte Cloudinary (pour les images)

## 🛠 Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration environnement**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. **Démarrer MongoDB**
```bash
# Avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ou avec MongoDB installé localement
mongod
```

5. **Démarrer le serveur**
```bash
# Développement
npm run dev

# Production
npm start
```

## 🔧 Configuration

### Variables d'environnement

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ectriborne-crm

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📚 API Documentation

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/refresh` | Renouveler token |
| POST | `/api/auth/logout` | Déconnexion |
| GET | `/api/auth/me` | Profil utilisateur |

### Utilisateurs

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/api/users` | Liste utilisateurs | Admin |
| GET | `/api/users/technicians` | Liste techniciens | Admin |
| GET | `/api/users/clients` | Liste clients | Admin, Tech |
| GET | `/api/users/:id` | Détail utilisateur | Admin, Propriétaire |
| PUT | `/api/users/:id` | Modifier utilisateur | Admin, Propriétaire |
| DELETE | `/api/users/:id` | Supprimer utilisateur | Admin |

### Installations

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/api/installations` | Liste installations | Admin, Tech |
| GET | `/api/installations/my` | Mes installations | Client |
| GET | `/api/installations/:id` | Détail installation | Tous |
| POST | `/api/installations` | Créer installation | Admin |
| PUT | `/api/installations/:id` | Modifier installation | Admin, Tech assigné |
| DELETE | `/api/installations/:id` | Supprimer installation | Admin |

### Devis

| Méthode | Endpoint | Description | Rôles |
|---------|----------|-------------|-------|
| GET | `/api/quotes` | Liste devis | Admin, Tech |
| GET | `/api/quotes/my` | Mes devis | Client |
| GET | `/api/quotes/:id` | Détail devis | Tous |
| POST | `/api/quotes` | Créer devis | Admin, Tech |
| PUT | `/api/quotes/:id` | Modifier devis | Admin, Tech |
| POST | `/api/quotes/:id/send` | Envoyer devis | Admin, Tech |
| POST | `/api/quotes/:id/respond` | Répondre au devis | Client |

## 🏗 Architecture

```
backend/
├── models/           # Modèles Mongoose
│   ├── User.js
│   ├── Installation.js
│   ├── Quote.js
│   └── Message.js
├── routes/           # Routes API
│   ├── auth.js
│   ├── users.js
│   ├── installations.js
│   ├── quotes.js
│   └── messages.js
├── middlewares/      # Middlewares
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── errorHandler.js
├── controllers/      # Contrôleurs (optionnel)
├── services/         # Services métier
├── utils/           # Utilitaires
└── server.js        # Point d'entrée
```

## 🔒 Sécurité

- **Helmet.js** pour les headers de sécurité
- **Rate limiting** pour prévenir les attaques
- **Validation** des données avec Joi
- **Hachage** des mots de passe avec bcrypt
- **JWT** avec refresh tokens
- **CORS** configuré

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests avec coverage
npm run test:coverage
```

## 📦 Déploiement

### Avec Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Variables de production

- Utiliser des secrets sécurisés pour JWT
- Configurer MongoDB Atlas ou cluster
- Utiliser HTTPS en production
- Configurer les logs avec Winston

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support :
- Email: support@ectriborne.com
- Documentation: [docs.ectriborne.com](https://docs.ectriborne.com)