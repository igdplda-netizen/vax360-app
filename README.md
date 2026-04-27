<p align="center">
  <img src="icons/icon-192.png" alt="Vax360 Logo" width="100" />
</p>

<h1 align="center">Vax360 💉</h1>

<p align="center">
  <strong>Track and manage your children's vaccination schedule with ease.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.0-6366f1?style=flat-square" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PWA-ready-blueviolet?style=flat-square" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Capacitor-6-119EFF?style=flat-square&logo=capacitor&logoColor=white" alt="Capacitor" />
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Mobile (Capacitor)](#-mobile-capacitor)
- [Multilingual Support](#-multilingual-support)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🩺 About

**Vax360** is a Progressive Web App (PWA) designed to help **parents** and **healthcare administrators** track children's vaccination schedules. It works offline, supports multiple languages, and can be deployed as a native mobile app through Capacitor.

Built with a focus on accessibility, data privacy, and ease of use in regions with limited connectivity.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📅 **Smart Scheduling** | Automatic vaccine timeline based on each child's date of birth |
| 👨‍👩‍👧‍👦 **Multi-Child Support** | Track multiple children per family |
| 🔐 **Role-Based Access** | Separate Parent & Admin interfaces with PIN protection |
| 🛡️ **Super Admin** | Elevated privileges for managing admins and system settings |
| 🌍 **Multilingual** | English, Portuguese, French, and Afrikaans |
| 📴 **Offline-First** | Full functionality without internet via Service Workers |
| 💾 **Data Sync** | SQLite backend API for data persistence and backup |
| 📊 **Dashboard** | Per-child vaccination progress with overdue/pending/completed stats |
| 🔗 **Vaccine Dependencies** | Enforces prerequisite vaccines before allowing dose completion |
| 📋 **History & Filters** | Filter vaccination history by child, type, and date range |
| ✅ **Pros & Cons** | Detailed benefits and side effects for each vaccine |
| 📤 **Import/Export** | Backup and restore data as JSON |
| 🌙 **Dark Mode** | Toggle between light and dark themes |
| 📱 **Capacitor** | Deploy as native Android/iOS app |

---

## 📸 Screenshots

> Screenshots coming soon. Run the app locally to see it in action!

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla HTML, CSS, JavaScript (no framework) |
| **Backend** | Node.js + Express 5 |
| **Database** | SQLite 3 |
| **PWA** | Service Workers, Web App Manifest |
| **Mobile** | Capacitor 6 (Android & iOS) |
| **i18n** | Built-in translation engine (EN, PT, FR, AF) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/igdplda-netizen/vax360-app.git
cd vax360-app

# 2. Run the full setup (installs deps + creates database)
npm run setup
```

Or manually:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Initialize the database
npm run db:init
```

### Environment Variables

Copy the example environment file and adjust values as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend API port |
| `NODE_ENV` | `development` | Environment (`development` / `production`) |
| `DB_PATH` | `./database.sqlite` | Path to SQLite database file |
| `DEFAULT_ADMIN_PIN` | `1234` | Default admin PIN on first setup |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origins (comma-separated) |
| `API_URL` | `http://localhost:5000` | Backend URL used by the frontend |

### Database Setup

```bash
# Create / initialize the database
npm run db:init

# Reset database (delete and recreate)
npm run db:reset
```

The database is automatically created with these tables:

| Table | Purpose |
|---|---|
| `store` | Key-value store for frontend data sync |
| `audit_log` | Tracks data change history |
| `app_meta` | Application metadata and versioning |

### Running the App

```bash
# Start both frontend and backend
npm run dev:all

# Or start them separately:
npm run dev          # Frontend on http://localhost:3000
npm run dev:backend  # Backend API on http://localhost:5000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
vax360/
├── index.html           # Main HTML (PWA entry point)
├── 200.html             # SPA fallback for client-side routing
├── app.js               # Core application logic (3,200+ lines)
├── style.css            # All styles (1,160+ lines)
├── sw.js                # Service Worker for offline caching
├── manifest.json        # PWA Web App Manifest
├── capacitor.config.ts  # Capacitor native app configuration
├── package.json         # Root dependencies & scripts
├── .env.example         # Environment variable template
├── .gitignore           # Git ignore rules
├── icons/
│   ├── icon-192.png     # PWA icon (192×192)
│   └── icon-512.png     # PWA icon (512×512)
└── backend/
    ├── server.js        # Express API server
    ├── db-init.js       # Database initialization script
    └── package.json     # Backend dependencies
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check (status, environment, uptime) |
| `GET` | `/api/sync/:id` | Retrieve synced data by ID |
| `POST` | `/api/sync/:id` | Save/update synced data by ID |

### Example

```bash
# Health check
curl http://localhost:5000/api/health

# Save data
curl -X POST http://localhost:5000/api/sync/user-123 \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "children": []}'

# Retrieve data
curl http://localhost:5000/api/sync/user-123
```

---

## 📱 Mobile (Capacitor)

Build native apps for Android and iOS:

```bash
# Initialize Capacitor
npm run cap:init

# Add platforms
npm run cap:add:android
npm run cap:add:ios

# Sync web assets → native projects
npm run cap:sync

# Open in IDE
npm run cap:open:android   # Opens in Android Studio
npm run cap:open:ios       # Opens in Xcode
```

---

## 🌍 Multilingual Support

Vax360 supports 4 languages out of the box:

| Code | Language | Flag |
|---|---|---|
| `en` | English | 🇬🇧 |
| `pt` | Português | 🇧🇷 |
| `fr` | Français | 🇫🇷 |
| `af` | Afrikaans | 🇿🇦 |

Language can be changed at any time from the Settings page. The selection is persisted in `localStorage`.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create a **feature branch**: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'feat: add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. Open a **Pull Request**

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by the Vax360 Team
</p>
