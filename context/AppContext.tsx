import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '../lib/storage';
import { VACCINE_SCHEDULE, Vaccine } from '../constants/vaccines';

export type Language = 'en' | 'pt' | 'fr' | 'af';
export type ThemeMode = 'light' | 'dark';
export type VaccineStatus = 'completed' | 'upcoming' | 'overdue' | 'pending';

export interface Child {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  vaccines: VaccineRecord[];
}

export interface VaccineRecord {
  vaccineId: string;
  status: VaccineStatus;
  completedDate?: string;
  scheduledDate: string;
  notes?: string;
}

export interface User {
  name: string;
  whatsapp: string;
  email: string | null;
}

export interface PartnerBranding {
  logo: string;
  link: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface AppState {
  language: Language;
  theme: ThemeMode;
  children: Child[];
  currentChildId: string | null;
  isOnboarded: boolean;
  token: string | null;
  userRole: 'parent' | 'admin' | 'superadmin' | null;
  currentUser: User | null;
  partnerBranding: PartnerBranding | null;
}

interface AppContextType {
  state: AppState;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeMode) => void;
  addChild: (child: Omit<Child, 'id' | 'vaccines'>) => void;
  updateChild: (id: string, updates: Partial<Child>) => void;
  removeChild: (id: string) => void;
  setCurrentChild: (id: string | null) => void;
  markVaccineCompleted: (childId: string, vaccineId: string, date?: string) => void;
  markVaccinePending: (childId: string, vaccineId: string) => void;
  getVaccineStatus: (child: Child, vaccineId: string) => VaccineStatus;
  getScheduledDate: (birthDate: string, ageMonths: number) => string;
  getVaccinesForChild: (child: Child) => (Vaccine & { status: VaccineStatus; scheduledDate: string })[];
  completeOnboarding: () => void;
  t: (key: string) => string;

  // Connection & API
  API_BASE_URL: string;
  isOnline: boolean;
  syncPending: boolean;
  login: (whatsapp: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; tempToken?: string; error?: string }>;
  login2FA: (tempToken: string, code: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (name: string, whatsapp: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  get2FAStatus: () => Promise<boolean>;
  setup2FA: () => Promise<{ secret: string; qrCode: string }>;
  enable2FA: (code: string) => Promise<boolean>;
  disable2FA: (code: string) => Promise<boolean>;
  syncData: () => Promise<boolean>;
  updateBranding: (branding: PartnerBranding) => Promise<boolean>;
  loadBranding: () => Promise<void>;
}

const STORAGE_KEY = 'vax360_state';

const DEFAULT_STATE: AppState = {
  language: 'pt',
  theme: 'light',
  children: [],
  currentChildId: null,
  isOnboarded: false,
  token: null,
  userRole: null,
  currentUser: null,
  partnerBranding: null,
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'Vax360',
    tagline: "Your Child's Health, Organized",
    home: 'Home',
    children: 'Children',
    schedule: 'Schedule',
    settings: 'Settings',
    addChild: 'Add Child',
    childName: "Child's Name",
    birthDate: 'Birth Date',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    completed: 'Completed',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    pending: 'Pending',
    markDone: 'Mark as Done',
    undo: 'Undo',
    vaccineDetails: 'Vaccine Details',
    benefits: 'Benefits',
    sideEffects: 'Side Effects',
    scheduledFor: 'Scheduled for',
    ageAtBirth: 'At Birth',
    months: 'months',
    noChildren: 'No children added yet',
    addFirstChild: 'Add your first child to start tracking vaccines',
    noUpcoming: 'No upcoming vaccines',
    allCaughtUp: 'All caught up!',
    overdueVaccines: 'Overdue Vaccines',
    darkMode: 'Dark Mode',
    language: 'Language',
    english: 'English',
    portuguese: 'Portuguese',
    french: 'French',
    afrikaans: 'Afrikaans',
    about: 'About',
    version: 'Version 3.0.0',
    totalVaccines: 'Total Vaccines',
    completedVaccines: 'Completed',
    progress: 'Progress',
    getStarted: 'Get Started',
    welcomeTitle: 'Track Vaccinations',
    welcomeDesc: "Keep your child's vaccination schedule organized and never miss a dose.",
    smartScheduling: 'Smart Scheduling',
    smartSchedulingDesc: "Automatic vaccine schedule based on your child's age",
    securePrivate: 'Secure & Private',
    securePrivateDesc: 'Your data is protected and stored locally',
    multiChild: 'Multi-Child Support',
    multiChildDesc: 'Track multiple children in one app',
    reminders: 'Reminders',
    remindersDesc: 'Get notified when vaccines are due',
    login: 'Login',
    register: 'Register',
    whatsapp: 'WhatsApp / Phone',
    password: 'Password',
    email: 'Email',
    name: 'Name',
    logout: 'Logout',
    sync: 'Sync Data',
    syncing: 'Syncing...',
    syncSuccess: 'Data synced successfully!',
    syncFailed: 'Sync failed',
    twoFactor: '2FA Authentication',
    enable2FA: 'Enable 2FA',
    disable2FA: 'Disable 2FA',
    invalidCode: 'Invalid 2FA code',
    adminDashboard: 'Clinical Dashboard',
    brandingSettings: 'Branding Settings',
    noAccount: "Don't have an account? Register",
    alreadyAccount: 'Already have an account? Login',
  },
  pt: {
    appName: 'Vax360',
    tagline: 'A Saúde do Seu Filho, Organizada',
    home: 'Início',
    children: 'Crianças',
    schedule: 'Calendário',
    settings: 'Configurações',
    addChild: 'Adicionar Criança',
    childName: 'Nome da Criança',
    birthDate: 'Data de Nascimento',
    gender: 'Género',
    male: 'Masculino',
    female: 'Feminino',
    other: 'Outro',
    save: 'Salvar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Excluir',
    completed: 'Concluída',
    upcoming: 'Próxima',
    overdue: 'Atrasada',
    pending: 'Pendente',
    markDone: 'Marcar como Feita',
    undo: 'Desfazer',
    vaccineDetails: 'Detalhes da Vacina',
    benefits: 'Benefícios',
    sideEffects: 'Efeitos Colaterais',
    scheduledFor: 'Agendada para',
    ageAtBirth: 'Ao Nascer',
    months: 'meses',
    noChildren: 'Nenhuma criança adicionada',
    addFirstChild: 'Adicione sua primeira criança para começar',
    noUpcoming: 'Nenhuma vacina próxima',
    allCaughtUp: 'Tudo em dia!',
    overdueVaccines: 'Vacinas Atrasadas',
    darkMode: 'Modo Escuro',
    language: 'Idioma',
    english: 'Inglês',
    portuguese: 'Português',
    french: 'Francês',
    afrikaans: 'Afrikaans',
    about: 'Sobre',
    version: 'Versão 3.0.0',
    totalVaccines: 'Total de Vacinas',
    completedVaccines: 'Concluídas',
    progress: 'Progresso',
    getStarted: 'Começar',
    welcomeTitle: 'Acompanhe Vacinações',
    welcomeDesc: 'Mantenha o calendário de vacinação do seu filho organizado e nunca perca uma dose.',
    smartScheduling: 'Agendamento Inteligente',
    smartSchedulingDesc: 'Calendário automático de vacinas baseado na idade da criança',
    securePrivate: 'Seguro e Privado',
    securePrivateDesc: 'Seus dados são protegidos e armazenados localmente',
    multiChild: 'Várias Crianças',
    multiChildDesc: 'Acompanhe várias crianças em um só app',
    reminders: 'Lembretes',
    remindersDesc: 'Receba notificações quando as vacinas estiverem devendo',
    login: 'Entrar',
    register: 'Registar',
    whatsapp: 'WhatsApp / Telefone',
    password: 'Senha',
    email: 'E-mail',
    name: 'Nome',
    logout: 'Terminar Sessão',
    sync: 'Sincronizar',
    syncing: 'A sincronizar...',
    syncSuccess: 'Dados sincronizados com sucesso!',
    syncFailed: 'Falha na sincronização',
    twoFactor: 'Autenticação 2FA',
    enable2FA: 'Ativar 2FA',
    disable2FA: 'Desativar 2FA',
    invalidCode: 'Código 2FA inválido',
    adminDashboard: 'Painel Clínico',
    brandingSettings: 'Definições de Marca',
    noAccount: 'Não tem uma conta? Registe-se',
    alreadyAccount: 'Já tem uma conta? Entre',
  },
  fr: {
    appName: 'Vax360',
    tagline: "La Santé de Votre Enfant, Organisée",
    home: 'Accueil',
    children: 'Enfants',
    schedule: 'Calendrier',
    settings: 'Paramètres',
    addChild: 'Ajouter Enfant',
    childName: "Nom de l'enfant",
    birthDate: 'Date de naissance',
    gender: 'Genre',
    male: 'Masculin',
    female: 'Féminin',
    other: 'Autre',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    completed: 'Terminé',
    upcoming: 'À venir',
    overdue: 'En retard',
    pending: 'En attente',
    markDone: 'Marquer comme fait',
    undo: 'Annuler',
    vaccineDetails: 'Détails du vaccin',
    benefits: 'Bénéfices',
    sideEffects: 'Effets secondaires',
    scheduledFor: 'Prévu le',
    ageAtBirth: 'À la naissance',
    months: 'mois',
    noChildren: 'Aucun enfant ajouté',
    addFirstChild: 'Ajoutez votre premier enfant pour commencer',
    noUpcoming: 'Aucun vaccin à venir',
    allCaughtUp: 'Tout est à jour !',
    overdueVaccines: 'Vaccins en retard',
    darkMode: 'Mode Sombre',
    language: 'Langue',
    english: 'Anglais',
    portuguese: 'Portugais',
    french: 'Français',
    afrikaans: 'Afrikaans',
    about: 'À propos',
    version: 'Version 3.0.0',
    totalVaccines: 'Total des vaccins',
    completedVaccines: 'Terminés',
    progress: 'Progression',
    getStarted: 'Commencer',
    welcomeTitle: 'Suivre les Vaccinations',
    welcomeDesc: 'Gardez le calendrier vaccinal de votre enfant organisé et ne manquez jamais une dose.',
    smartScheduling: 'Planification Intelligente',
    smartSchedulingDesc: 'Calendrier de vaccination automatique basé sur l\'âge',
    securePrivate: 'Sécurisé et Privé',
    securePrivateDesc: 'Vos données sont protégées et stockées localement',
    multiChild: 'Plusieurs Enfants',
    multiChildDesc: 'Suivez plusieurs enfants dans une seule application',
    reminders: 'Rappels',
    remindersDesc: 'Recevez des notifications pour les vaccins dus',
    login: 'Connexion',
    register: 'S\'inscrire',
    whatsapp: 'WhatsApp / Téléphone',
    password: 'Mot de passe',
    email: 'E-mail',
    name: 'Nom',
    logout: 'Déconnexion',
    sync: 'Synchroniser',
    syncing: 'Synchro...',
    syncSuccess: 'Données synchronisées !',
    syncFailed: 'Échec de synchro',
    twoFactor: 'Authentification 2FA',
    enable2FA: 'Activer 2FA',
    disable2FA: 'Désactiver 2FA',
    invalidCode: 'Code 2FA invalide',
    adminDashboard: 'Tableau Clinique',
    brandingSettings: 'Paramètres de Marque',
    noAccount: "Pas de compte ? S'inscrire",
    alreadyAccount: 'Déjà un compte ? Connexion',
  },
  af: {
    appName: 'Vax360',
    tagline: 'U Kind se Gesondheid, Georganiseer',
    home: 'Tuis',
    children: 'Kinders',
    schedule: 'Skedule',
    settings: 'Instellings',
    addChild: 'Voeg Kind By',
    childName: 'Kind se Naam',
    birthDate: 'Geboortedatum',
    gender: 'Geslag',
    male: 'Manlik',
    female: 'Vroulik',
    other: 'Ander',
    save: 'Stoor',
    cancel: 'Kanselleer',
    edit: 'Wysig',
    delete: 'Verwyder',
    completed: 'Voltooi',
    upcoming: 'Opkomend',
    overdue: 'Agterstallig',
    pending: 'Hangende',
    markDone: 'Merk as Voltooi',
    undo: 'Ontdoen',
    vaccineDetails: 'Entstofbesonderhede',
    benefits: 'Voordele',
    sideEffects: 'Newe-effekte',
    scheduledFor: 'Geskeduleer vir',
    ageAtBirth: 'By Geboorte',
    months: 'maande',
    noChildren: 'Nog geen kinders bygevoeg nie',
    addFirstChild: 'Voeg u eerste kind by om entstowwe te volg',
    noUpcoming: 'Geen opkomende entstowwe nie',
    allCaughtUp: 'Alles op datum!',
    overdueVaccines: 'Agterstallige Entstowwe',
    darkMode: 'Donker Modus',
    language: 'Taal',
    english: 'Engels',
    portuguese: 'Portugees',
    french: 'Frans',
    afrikaans: 'Afrikaans',
    about: 'Oor',
    version: 'Weergawe 3.0.0',
    totalVaccines: 'Totale Entstowwe',
    completedVaccines: 'Voltooi',
    progress: 'Vordering',
    getStarted: 'Begin',
    welcomeTitle: 'Volg Entstowwe',
    welcomeDesc: 'Hou u kind se entstofskedule georganiseer en mis nooit \'n dosis nie.',
    smartScheduling: 'Slim Skedulering',
    smartSchedulingDesc: 'Outomatiese entstofskedule gebaseer op u kind se ouderdom',
    securePrivate: 'Veilig en Privaat',
    securePrivateDesc: 'U data word beskerm en plaaslik gestoor',
    multiChild: 'Multi-Kind',
    multiChildDesc: 'Volg verskeie kinders in een app',
    reminders: 'Herinnerings',
    remindersDesc: 'Kry kennisgewings wanneer entstowwe verskuldig is',
    login: 'Meld aan',
    register: 'Registreer',
    whatsapp: 'WhatsApp / Telefoon',
    password: 'Wagwoord',
    email: 'E-pos',
    name: 'Naam',
    logout: 'Meld af',
    sync: 'Sinkroniseer',
    syncing: 'Besig om te sinkroniseer...',
    syncSuccess: 'Data suksesvol gesinkroniseer!',
    syncFailed: 'Sinkronisering het misluk',
    twoFactor: '2FA-verifikasie',
    enable2FA: 'Aktiveer 2FA',
    disable2FA: 'Deaktiveer 2FA',
    invalidCode: 'Ongeldige 2FA-kode',
    adminDashboard: 'Kliniese Paneel',
    brandingSettings: 'Branding-instellings',
    noAccount: 'Nog nie geregistreer nie? Registreer',
    alreadyAccount: 'Reeds geregistreer? Meld aan',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dynamic API Base URL detection
let API_BASE_URL = 'http://localhost:5000/api';

export async function detectApiBaseUrl(): Promise<string> {
  // Both in the Replit dev workspace and in production, only a single public
  // origin/port is reachable from the browser. The dev server (Metro, on the
  // same port the page is served from) proxies /api/* to the backend, and in
  // production server.js serves both from one origin. So we always use the
  // current page's origin rather than a hardcoded backend port.
  if (process.env.EXPO_PUBLIC_DOMAIN) {
    API_BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
    return API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Development workspace on Replit or any deployed/production environment:
    // route API calls through the same origin the page was loaded from.
    if (hostname.includes('replit.dev') || hostname.includes('repl.co')) {
      API_BASE_URL = `${window.location.origin}/api`;
      return API_BASE_URL;
    }
    // Production deployment or other environments
    if (hostname !== 'localhost' && !window.location.href.startsWith('https://localhost')) {
      API_BASE_URL = `${window.location.origin}/api`;
      return API_BASE_URL;
    }
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    const res = await fetch('http://localhost:5000/api/health', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      API_BASE_URL = 'http://localhost:5000/api';
      return API_BASE_URL;
    }
  } catch (err) {
    // Ignore
  }
  API_BASE_URL = 'http://10.0.2.2:5000/api';
  return API_BASE_URL;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [syncPending, setSyncPending] = useState(false);

  useEffect(() => {
    detectApiBaseUrl().then(() => {
      loadState();
    });
  }, []);

  const loadState = async () => {
    const saved = await getItem<AppState>(STORAGE_KEY);
    if (saved) {
      setState(prev => ({ ...prev, ...saved }));
    }
    setLoaded(true);
  };

  const saveState = useCallback(async (newState: AppState) => {
    setState(newState);
    await setItem(STORAGE_KEY, newState);
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setState(prev => {
      const next = { ...prev, language };
      setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setState(prev => {
      const next = { ...prev, theme };
      setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setState(prev => {
      const next = { ...prev, isOnboarded: true };
      setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const getScheduledDate = useCallback((birthDate: string, ageMonths: number): string => {
    const d = new Date(birthDate);
    d.setMonth(d.getMonth() + ageMonths);
    return d.toISOString().split('T')[0];
  }, []);

  const addChild = useCallback((child: Omit<Child, 'id' | 'vaccines'>) => {
    setState(prev => {
      const newChild: Child = {
        ...child,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        vaccines: VACCINE_SCHEDULE.map(v => ({
          vaccineId: v.id,
          status: 'pending' as VaccineStatus,
          scheduledDate: getScheduledDate(child.birthDate, v.ageMonths),
        })),
      };
      const next = {
        ...prev,
        children: [...prev.children, newChild],
        currentChildId: newChild.id,
      };
      setItem(STORAGE_KEY, next);
      // Auto-trigger background sync
      setTimeout(() => syncData(), 500);
      return next;
    });
  }, [getScheduledDate]);

  const updateChild = useCallback((id: string, updates: Partial<Child>) => {
    setState(prev => {
      const next = {
        ...prev,
        children: prev.children.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
      };
      setItem(STORAGE_KEY, next);
      setTimeout(() => syncData(), 500);
      return next;
    });
  }, []);

  const removeChild = useCallback((id: string) => {
    setState(prev => {
      const next = {
        ...prev,
        children: prev.children.filter(c => c.id !== id),
        currentChildId: prev.currentChildId === id ? (prev.children[0]?.id || null) : prev.currentChildId,
      };
      setItem(STORAGE_KEY, next);
      setTimeout(() => syncData(), 500);
      return next;
    });
  }, []);

  const setCurrentChild = useCallback((id: string | null) => {
    setState(prev => {
      const next = { ...prev, currentChildId: id };
      setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const markVaccineCompleted = useCallback((childId: string, vaccineId: string, date?: string) => {
    setState(prev => {
      const next = {
        ...prev,
        children: prev.children.map(c => {
          if (c.id !== childId) return c;
          return {
            ...c,
            vaccines: c.vaccines.map(v =>
              v.vaccineId === vaccineId
                ? { ...v, status: 'completed' as VaccineStatus, completedDate: date || new Date().toISOString().split('T')[0] }
                : v
            ),
          };
        }),
      };
      setItem(STORAGE_KEY, next);
      setTimeout(() => syncData(), 500);
      return next;
    });
  }, []);

  const markVaccinePending = useCallback((childId: string, vaccineId: string) => {
    setState(prev => {
      const next = {
        ...prev,
        children: prev.children.map(c => {
          if (c.id !== childId) return c;
          return {
            ...c,
            vaccines: c.vaccines.map(v =>
              v.vaccineId === vaccineId
                ? { ...v, status: 'pending' as VaccineStatus, completedDate: undefined }
                : v
            ),
          };
        }),
      };
      setItem(STORAGE_KEY, next);
      setTimeout(() => syncData(), 500);
      return next;
    });
  }, []);

  const getVaccineStatus = useCallback((child: Child, vaccineId: string): VaccineStatus => {
    const record = child.vaccines.find(v => v.vaccineId === vaccineId);
    if (!record) return 'pending';
    if (record.status === 'completed') return 'completed';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sched = new Date(record.scheduledDate);
    sched.setHours(0, 0, 0, 0);
    const diff = (sched.getTime() - today.getTime()) / 864e5;
    if (diff < 0) return 'overdue';
    if (diff <= 30) return 'upcoming';
    return 'pending';
  }, []);

  const getVaccinesForChild = useCallback((child: Child) => {
    return VACCINE_SCHEDULE.map(v => {
      const record = child.vaccines.find(rv => rv.vaccineId === v.id);
      const status = record ? getVaccineStatus(child, v.id) : 'pending';
      const scheduledDate = record ? record.scheduledDate : getScheduledDate(child.birthDate, v.ageMonths);
      return { ...v, status, scheduledDate };
    });
  }, [getVaccineStatus, getScheduledDate]);

  const t = useCallback((key: string): string => {
    return translations[state.language]?.[key] || translations.en[key] || key;
  }, [state.language]);

  // Authentication logic
  const login = async (whatsapp: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      if (data.two_factor_required) {
        return { success: true, requires2FA: true, tempToken: data.temp_token };
      }
      const next = {
        ...state,
        token: data.token,
        userRole: data.role,
        currentUser: data.user,
      };
      await saveState(next);
      // Trigger sync
      setTimeout(() => syncData(), 500);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const login2FA = async (tempToken: string, code: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login/2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temp_token: tempToken, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid code' };
      }
      const next = {
        ...state,
        token: data.token,
        userRole: data.role,
        currentUser: data.user,
      };
      await saveState(next);
      setTimeout(() => syncData(), 500);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const registerUser = async (name: string, whatsapp: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, whatsapp, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Server connection failed' };
    }
  };

  const logout = useCallback(async () => {
    const next: AppState = {
      ...DEFAULT_STATE,
      language: state.language,
      theme: state.theme,
      isOnboarded: state.isOnboarded,
    };
    await saveState(next);
  }, [state, saveState]);

  // 2FA Security
  const get2FAStatus = async (): Promise<boolean> => {
    if (!state.token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/2fa/status`, {
        headers: { 'Authorization': `Bearer ${state.token}` },
      });
      const data = await res.json();
      return !!data.twoFactorEnabled;
    } catch {
      return false;
    }
  };

  const setup2FA = async (): Promise<{ secret: string; qrCode: string }> => {
    if (!state.token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE_URL}/2fa/setup`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${state.token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to setup 2FA');
    return { secret: data.secret, qrCode: data.qrCode };
  };

  const enable2FA = async (code: string): Promise<boolean> => {
    if (!state.token) return false;
    const res = await fetch(`${API_BASE_URL}/2fa/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`,
      },
      body: JSON.stringify({ code }),
    });
    return res.ok;
  };

  const disable2FA = async (code: string): Promise<boolean> => {
    if (!state.token) return false;
    const res = await fetch(`${API_BASE_URL}/2fa/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`,
      },
      body: JSON.stringify({ code }),
    });
    return res.ok;
  };

  // Sync API
  const syncData = async (): Promise<boolean> => {
    if (!state.token || !state.currentUser) return false;
    setSyncPending(true);
    try {
      // 1. Post local children to sync
      const pushRes = await fetch(`${API_BASE_URL}/sync/${state.currentUser.whatsapp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify({ children: state.children }),
      });

      if (!pushRes.ok) {
        setIsOnline(false);
        setSyncPending(false);
        return false;
      }

      // 2. Fetch server state to merge
      const pullRes = await fetch(`${API_BASE_URL}/sync/${state.currentUser.whatsapp}`, {
        headers: { 'Authorization': `Bearer ${state.token}` },
      });
      const pullData = await pullRes.json();
      if (pullRes.ok && pullData.success && pullData.data) {
        const mergedChildren = pullData.data.children || [];
        setState(prev => {
          const next = { ...prev, children: mergedChildren };
          setItem(STORAGE_KEY, next);
          return next;
        });
      }

      setIsOnline(true);
      setSyncPending(false);
      return true;
    } catch {
      setIsOnline(false);
      setSyncPending(false);
      return false;
    }
  };

  // Branding
  const loadBranding = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/partner-logo`);
      const data = await res.json();
      if (res.ok && data) {
        setState(prev => {
          const next = { ...prev, partnerBranding: data };
          setItem(STORAGE_KEY, next);
          return next;
        });
      }
    } catch {
      // Ignore
    }
  };

  const updateBranding = async (branding: PartnerBranding): Promise<boolean> => {
    if (!state.token || state.userRole !== 'superadmin') return false;
    try {
      const res = await fetch(`${API_BASE_URL}/partner-logo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`,
        },
        body: JSON.stringify(branding),
      });
      if (res.ok) {
        setState(prev => {
          const next = { ...prev, partnerBranding: branding };
          setItem(STORAGE_KEY, next);
          return next;
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (state.token) {
      loadBranding();
    }
  }, [state.token]);

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{
      state,
      setLanguage,
      setTheme,
      addChild,
      updateChild,
      removeChild,
      setCurrentChild,
      markVaccineCompleted,
      markVaccinePending,
      getVaccineStatus,
      getScheduledDate,
      getVaccinesForChild,
      completeOnboarding,
      t,
      API_BASE_URL,
      isOnline,
      syncPending,
      login,
      login2FA,
      registerUser,
      logout,
      get2FAStatus,
      setup2FA,
      enable2FA,
      disable2FA,
      syncData,
      updateBranding,
      loadBranding,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
