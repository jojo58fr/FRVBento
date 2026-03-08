# Bento for VTubers
*(Fork of OpenBento)*

**Bento for VTubers** est un fork open-source de **OpenBento**, un générateur de pages *link-in-bio* moderne basé sur une grille bento.

Ce fork a pour objectif d’étendre OpenBento afin de proposer une **solution dédiée aux VTubers**, incluant **l’hébergement des pages bento via une URL publique**, tout en restant fidèle aux valeurs open-source, à la portabilité et à la philosophie *privacy-first* du projet original.

Exemple d’URL publique :  
https://bento.frvtubers.com/username

---

## 🎯 Pourquoi ce fork ?

OpenBento est conçu comme un **builder local avec export**, sans backend ni comptes utilisateurs.

**Bento for VTubers** existe pour :

- proposer une **version hébergée** du bento
- permettre aux VTubers de publier leur page sans gérer le déploiement
- rester sur une **solution open-source**
- soutenir indirectement le développement d’OpenBento
- offrir une alternative aux services propriétaires de link-in-bio

Le cœur du builder reste basé sur OpenBento, mais l’export devient une **page accessible via une URL du site**.
Le cœur du builder reste basé sur OpenBento, mais l’export devient une **page accessible via une URL du site**.

### Color Editing

- Use the background action in the top bar to open a dedicated background editor
- Name and bio now expose a palette button next to the edit pencil in the builder
- Custom colors use an inline picker widget with presets, HEX input, and eyedropper support when the browser supports `EyeDropper`

---

## ✨ Fonctionnalités

### 🧱 Bento Builder (hérité d’OpenBento)

- Éditeur visuel **drag & drop** (grille 9×9)
- 7 types de blocs :
  - 🔗 Links
  - 🖼️ Media (images & GIFs)
  - 📺 YouTube
  - 📝 Text
  - 🌐 Social (26+ plateformes)
  - 📍 Map
  - ⬜ Spacer
- Personnalisation avancée :
  - couleurs et gradients
  - arrière-plans personnalisés
  - avatars (formes, bordures, ombres)
- Export **React / Vite / Tailwind** toujours disponible

---

### 🌐 Spécificités Bento for VTubers

- Comptes utilisateurs
- Publication automatique sur :
  https://bento.frvtubers.com/<username>
- Mise à jour du bento sans redéploiement manuel
- Pensé pour les VTubers et créateurs :
  - Twitch / YouTube
  - réseaux sociaux
  - liens de stream, dons, merch, etc.
- Base évolutive pour des blocs spécifiques VTubers

---

## 🔓 Open-source & philosophie

- Projet **open-source**
- Fork assumé d’OpenBento
- Licence **MIT**
- Aucune captation ou revente de données
- Possibilité d’exporter et d’auto-héberger son bento

Même avec une solution hébergée, l’objectif est de **laisser le contrôle aux créateurs**, dans l'esprit des projets qu'on fais sous le nom FRVtubers.

---

## 🛠️ Stack technique

### Builder

- React
- Vite
- TypeScript
- Tailwind CSS

### Backend (URL + sauvegarde)

- Next.js API routes
- Prisma + SQLite (fichier local)

Initialisation locale (une seule fois) :

```bash
npx prisma migrate dev --name init
```

### Plateforme (fork)

- Backend pour la gestion des utilisateurs
- Génération d’URLs publiques
- Hébergement centralisé des pages bento

Les détails techniques peuvent évoluer avec le projet.

---

## 🤝 Contributions

Les contributions sont les bienvenues.

Vous pouvez contribuer pour :

- améliorer le builder
- ajouter des blocs spécifiques VTubers
- améliorer l’UX/UI
- corriger des bugs
- traductions

Le projet reste aligné avec l’esprit et la philosophie d’OpenBento. Toutes évolution sera reprise pour le reproposer par la suite à OpenBento et aider au développement de l'outil open-source dès que possible.

---

## 📄 Licence et crédits

Ce projet est un **fork d’OpenBento**.

Projet original :

- Yoan Bernabeu — GitHub : @yoanbernabeu
- Anis Ayari — GitHub : @anisayari

Licence : **MIT**

Merci aux auteurs originaux et à la communauté open-source.

---

## 🌱 Vision

Construire une solution durable, ouverte et respectueuse pour les VTubers et créateurs, sans dépendre de plateformes fermées ou en ayant une plateforme d'initiative open-source comme FRVtubers.
