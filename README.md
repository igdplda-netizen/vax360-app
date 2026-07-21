<p align="center">
  <img src="assets/images/icon.png" alt="Vax360 Logo" width="100" />
</p>

<h1 align="center">Vax360 💉</h1>

<p align="center">
  <strong>Gestão Inteligente e Transversal de Vacinação Infantil</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/versão-3.0.0-6366f1?style=flat-square" alt="Versão" />
  <img src="https://img.shields.io/badge/licença-MIT-green?style=flat-square" alt="Licença" />
  <img src="https://img.shields.io/badge/Expo_SDK-56-000000?style=flat-square&logo=expo&logoColor=white" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Capacitor-6-119EFF?style=flat-square&logo=capacitor&logoColor=white" alt="Capacitor" />
</p>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Tecnologias](#-tecnologias)
- [Instalação e Execução](#-instalação-e-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Segurança & Autenticação](#-segurança--autenticação)
- [Suporte Multilingue](#-suporte-multilingue)
- [Licença](#-licença)

---

## 🩺 Sobre

O **Vax360** é uma plataforma multiplataforma (Web, Android, iOS) desenhada para permitir que **encarregados de educação** e **super administradores** gerenciem o calendário de vacinação infantil de forma precisa, segura e offline-first. 

Foi desenvolvido com foco na usabilidade, integridade médica de dados (vacinas obrigatórias e internacionalmente recomendadas pela OMS) e exportação oficial de certificados em PDF com QR Code.

---

## ✨ Funcionalidades Principais

| Funcionalidade | Descrição |
|---|---|
| 📅 **Calendário Inteligente** | Cronograma de vacinas automático baseado na data de nascimento |
| 👨‍👩‍👧‍👦 **Gestão de Menores** | Suporte a múltiplas crianças por encarregado |
| 🛡️ **Painel SuperAdmin** | Gestão transversal da plataforma (utilizadores, papéis, dados de crianças, backups e logs de auditoria) |
| 🔒 **Autenticação Avançada** | JWT, Autenticação de Dois Fatores (2FA via QR Code) e Redefinição de Senha |
| 💉 **Base Médica Abrangente** | Detalhes de benefícios, efeitos colaterais, contraindicações e categorias (obrigatórias, recomendadas, viagem) |
| 📄 **Certificado PDF** | Exportação de certificado oficial em PDF com QR Code de verificação integrado |
| 🌐 **Multiplataforma Real** | Compatibilidade Web, iOS (Expo Go) e Android |
| 🌍 **Multilingue (4 Idiomas)** | Português (🇦🇴 Angola), Inglês (🇬🇧), Francês (🇫🇷) e Afrikaans (🇿🇦) |
| 💾 **Sincronização & Backup** | Integração backend com SQLite e sincronização offline-first |

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| **Frontend** | React Native (Expo SDK 56, Expo Router, TypeScript) |
| **Estilização** | Dynamic Theme Engine com suporte a Dark Mode & Sombras Cross-Platform |
| **Backend** | Node.js + Express 5 |
| **Base de Dados** | SQLite 3 + Sistema de Auditoria |
| **PDF & QR Code** | jsPDF + qrcode (rendição vetorizada de alta precisão) |
| **Nativo/Mobile** | Capacitor 6 (Android & iOS) |

---

## 🚀 Instalação e Execução

### Pré-requisitos
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Git**

### Configuração Inicial

```bash
# 1. Clonar o repositório
git clone https://github.com/igdplda-netizen/vax360-app.git
cd vax360-app

# 2. Instalação e inicialização da base de dados
npm run setup
```

### Executar a Aplicação

```bash
# Executar Frontend (Web/Expo) e Backend em simultâneo:
npm run dev:all

# Ou executar individualmente:
npm run dev          # Frontend (Metro Dev Server na porta 3000)
npm run dev:backend  # Backend API na porta 5000/5011
```

---

## 📁 Estrutura do Projeto

```
vax360/
├── app/                 # Rotas do Expo Router (login, tabs, admin-dashboard, forgot-password, 2fa, etc.)
├── components/          # Componentes reutilizáveis (FlagIcon, etc.)
├── constants/           # Constantes globais (tabela de vacinas expandida, cores)
├── context/             # AppContext (gestão de estado global, autenticação, i18n, sync)
├── utils/               # Utilitários (exportador de PDF, formato de datas, sombras cross-platform)
├── assets/              # Imagens e ícones de marca do app
├── backend/             # API Express & Base de Dados SQLite
│   ├── server.js        # Servidor Express API
│   ├── db-init.js       # Inicialização da base de dados e migrações
│   └── package.json     # Dependências do servidor
├── app.json             # Configuração do Expo SDK
├── metro.config.js      # Configuração do Metro Bundler (filtros cross-platform)
├── capacitor.config.ts  # Configuração de builds nativas Capacitor
└── package.json         # Dependências do projeto
```

---

## 📡 Endpoints da API Principal

| Método | Endpoint | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/health` | Estado do servidor | Público |
| `POST` | `/api/login` | Login com WhatsApp/Senha | Público |
| `POST` | `/api/login/2fa` | Verificação do código 2FA | Público |
| `POST` | `/api/auth/reset-password` | Redefinição de senha | Público |
| `GET` | `/api/sync/:id` | Obter dados sincronizados | Autenticado |
| `POST` | `/api/sync/:id` | Sincronizar dados do encarregado | Autenticado |
| `GET` | `/api/admin/stats` | Estatísticas globais da plataforma | SuperAdmin |
| `GET` | `/api/admin/users` | Lista de todos os utilizadores e papéis | SuperAdmin |
| `PUT` | `/api/admin/users/:whatsapp/role` | Alterar papel de utilizador | SuperAdmin |
| `GET` | `/api/admin/children` | Listagem transversal de menores | SuperAdmin |
| `GET` | `/api/admin/backup` | Gerar backup da base de dados | SuperAdmin |
| `GET` | `/api/audit` | Registo de auditoria do sistema | SuperAdmin |

---

## 🌍 Suporte Multilingue

| Código | Idioma | Bandeira |
|---|---|---|
| `pt` | Português | 🇦🇴 Angola |
| `en` | English | 🇬🇧 |
| `fr` | Français | 🇫🇷 |
| `af` | Afrikaans | 🇿🇦 |

---

## 📄 Licença

Este projeto está licenciado sob a licença **MIT** — veja o ficheiro [LICENSE](LICENSE) para mais detalhes.
