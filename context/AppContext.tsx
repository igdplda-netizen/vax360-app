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

interface AppState {
  language: Language;
  theme: ThemeMode;
  children: Child[];
  currentChildId: string | null;
  isOnboarded: boolean;
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
}

const STORAGE_KEY = 'vax360_state';

const DEFAULT_STATE: AppState = {
  language: 'pt',
  theme: 'light',
  children: [],
  currentChildId: null,
  isOnboarded: false,
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
    welcomeDesc: 'Keep your child\'s vaccination schedule organized and never miss a dose.',
    smartScheduling: 'Smart Scheduling',
    smartSchedulingDesc: 'Automatic vaccine schedule based on your child\'s age',
    securePrivate: 'Secure & Private',
    securePrivateDesc: 'Your data is protected and stored locally',
    multiChild: 'Multi-Child Support',
    multiChildDesc: 'Track multiple children in one app',
    reminders: 'Reminders',
    remindersDesc: 'Get notified when vaccines are due',
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
  },
  fr: {
    appName: 'Vax360',
    tagline: "La Santé de Votre Enfant, Organisée",
    home: 'Accueil',
    children: 'Enfants',
    schedule: 'Calendrier',
    settings: 'Paramètres',
    addChild: 'Ajouter un Enfant',
    childName: "Nom de l'Enfant",
    birthDate: 'Date de Naissance',
    gender: 'Genre',
    male: 'Masculin',
    female: 'Féminin',
    other: 'Autre',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    completed: 'Terminée',
    upcoming: 'À Venir',
    overdue: 'En Retard',
    pending: 'En Attente',
    markDone: 'Marquer comme Fait',
    undo: 'Annuler',
    vaccineDetails: 'Détails du Vaccin',
    benefits: 'Bénéfices',
    sideEffects: 'Effets Secondaires',
    scheduledFor: 'Prévu pour',
    ageAtBirth: 'À la Naissance',
    months: 'mois',
    noChildren: "Aucun enfant ajouté",
    addFirstChild: "Ajoutez votre premier enfant pour commencer",
    noUpcoming: 'Aucun vaccin à venir',
    allCaughtUp: 'À jour!',
    overdueVaccines: 'Vaccins en Retard',
    darkMode: 'Mode Sombre',
    language: 'Langue',
    english: 'Anglais',
    portuguese: 'Portugais',
    french: 'Français',
    afrikaans: 'Afrikaans',
    about: 'À Propos',
    version: 'Version 3.0.0',
    totalVaccines: 'Total des Vaccins',
    completedVaccines: 'Terminés',
    progress: 'Progrès',
    getStarted: 'Commencer',
    welcomeTitle: 'Suivi des Vaccinations',
    welcomeDesc: 'Gardez le calendrier de vaccination de votre enfant organisé et ne manquez jamais une dose.',
    smartScheduling: 'Planification Intelligente',
    smartSchedulingDesc: 'Calendrier vaccinal automatique basé sur l\'age de l\'enfant',
    securePrivate: 'Sécurisé et Privé',
    securePrivateDesc: 'Vos données sont protégées et stockées localement',
    multiChild: 'Multi-Enfants',
    multiChildDesc: 'Suivez plusieurs enfants dans une seule app',
    reminders: 'Rappels',
    remindersDesc: 'Recevez des notifications quand les vaccins sont dus',
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
    upcoming: 'Komende',
    overdue: 'Agterstallig',
    pending: 'Hangend',
    markDone: 'Merk as Gedoen',
    undo: 'Ontdoen',
    vaccineDetails: 'Entstof Besonderhede',
    benefits: 'Voordele',
    sideEffects: 'Newe-effekte',
    scheduledFor: 'Geskeduleer vir',
    ageAtBirth: 'By Geboorte',
    months: 'maande',
    noChildren: 'Geen kinders bygevoeg nie',
    addFirstChild: 'Voeg u eerste kind by om te begin',
    noUpcoming: 'Geen komende entstowwe nie',
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
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    const saved = await getItem<AppState>(STORAGE_KEY);
    if (saved) {
      setState(saved);
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
      return next;
    });
  }, []);

  const updateChild = useCallback((id: string, updates: Partial<Child>) => {
    setState(prev => {
      const next = {
        ...prev,
        children: prev.children.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
      };
      setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const removeChild = useCallback((id: string) => {
    setState(prev => {
      const next = {
        ...prev,
        children: prev.children.filter(c => c.id !== id),
        currentChildId: prev.currentChildId === id ? (prev.children.find(c => c.id !== id)?.id || null) : prev.currentChildId,
      };
      setItem(STORAGE_KEY, next);
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

  const getScheduledDate = useCallback((birthDate: string, ageMonths: number): string => {
    const d = new Date(birthDate);
    d.setMonth(d.getMonth() + ageMonths);
    return d.toISOString().split('T')[0];
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
