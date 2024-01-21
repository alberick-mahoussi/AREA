FROM node:14-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copie uniquement les fichiers nécessaires pour l'installation des dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste des fichiers
COPY . .

# Exposer le port
EXPOSE 8081

# Commande pour exécuter l'application en mode développement
CMD ["npm", "start"]