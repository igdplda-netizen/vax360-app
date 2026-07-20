import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, Child } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { getDeviceDateFormat, parseInputDate, formatInputText, formatToDeviceDate, promptForDate } from '../utils/date';

interface UserRecord {
  whatsapp: string;
  name: string;
  email: string | null;
  role: 'parent' | 'admin' | 'superadmin';
  created_at?: string;
}

interface ChildRecord {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  parentWhatsapp: string;
  parentName: string;
  vaccinesCompleted: number;
  vaccinesTotal: number;
}

interface PlatformStats {
  totalUsers: number;
  totalParents: number;
  totalAdmins: number;
  totalSuperadmins: number;
  totalChildren: number;
  totalVaccinesCompleted: number;
  totalVaccinesPending: number;
}

type Tab = 'overview' | 'users' | 'children' | 'audit';

export default function AdminDashboardScreen() {
  const { state, API_BASE_URL, t } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const primaryColor = state.partnerBranding?.primaryColor || Colors.primary;

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(false);

  // Data
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [audits, setAudits] = useState<any[]>([]);

  // Search
  const [userSearch, setUserSearch] = useState('');
  const [childSearch, setChildSearch] = useState('');

  // Modals
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showResetPwModal, setShowResetPwModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Selected parent for child management
  const [selectedParent, setSelectedParent] = useState<UserRecord | null>(null);
  const [selectedParentChildren, setSelectedParentChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [showChildPanel, setShowChildPanel] = useState(false);

  // Add child modal
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthDate, setNewChildBirthDate] = useState('');
  const [newChildGender, setNewChildGender] = useState<'male' | 'female'>('male');

  const headers = { 'Authorization': `Bearer ${state.token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!state.token || state.userRole !== 'superadmin') {
      router.replace('/login');
      return;
    }
    loadStats();
  }, [state.token]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'children') loadChildren();
    if (activeTab === 'audit') loadAudits();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch (_) {}
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, { headers });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (_) {
      Alert.alert('Erro', 'Falha ao carregar utilizadores.');
    }
    setLoading(false);
  };

  const loadChildren = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/children`, { headers });
      const data = await res.json();
      if (data.success) setChildren(data.children);
    } catch (_) {
      Alert.alert('Erro', 'Falha ao carregar crianças.');
    }
    setLoading(false);
  };

  const loadAudits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/audit`, { headers });
      const data = await res.json();
      if (data.success) setAudits(data.audits);
    } catch (_) {
      Alert.alert('Erro', 'Falha ao carregar auditoria.');
    }
    setLoading(false);
  };

  const changeUserRole = async (whatsapp: string, newRole: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${whatsapp}/role`, {
        method: 'PUT', headers, body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Sucesso', `Papel alterado para ${newRole}`);
        setShowRoleModal(false);
        loadUsers();
        loadStats();
      } else {
        Alert.alert('Erro', data.error || 'Falha ao alterar papel.');
      }
    } catch (_) {
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  const resetUserPassword = async () => {
    if (!selectedUser || !newPassword) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.whatsapp}/reset-password`, {
        method: 'POST', headers, body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Sucesso', 'Senha redefinida com sucesso.');
        setShowResetPwModal(false);
        setNewPassword('');
      } else {
        Alert.alert('Erro', data.error || 'Falha ao redefinir senha.');
      }
    } catch (_) {
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.whatsapp}`, {
        method: 'DELETE', headers
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Sucesso', 'Utilizador eliminado.');
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        loadUsers();
        loadStats();
      } else {
        Alert.alert('Erro', data.error || 'Falha ao eliminar.');
      }
    } catch (_) {
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  const openParentChildren = async (user: UserRecord) => {
    setSelectedParent(user);
    setShowChildPanel(true);
    setLoadingChildren(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sync/${user.whatsapp}`, { headers });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedParentChildren(data.data.children || []);
      } else {
        setSelectedParentChildren([]);
      }
    } catch (_) {
      setSelectedParentChildren([]);
    }
    setLoadingChildren(false);
  };

  const saveParentChildren = async () => {
    if (!selectedParent) return;
    try {
      const res = await fetch(`${API_BASE_URL}/sync/${selectedParent.whatsapp}`, {
        method: 'POST', headers,
        body: JSON.stringify({ children: selectedParentChildren })
      });
      if (res.ok) {
        Alert.alert('Sucesso', 'Dados salvos.');
        loadChildren();
        loadStats();
      } else {
        Alert.alert('Erro', 'Falha ao salvar.');
      }
    } catch (_) {
      Alert.alert('Erro', 'Erro de conexão.');
    }
  };

  const deviceFormat = getDeviceDateFormat();

  const handleAddChild = () => {
    if (!newChildName || !newChildBirthDate) {
      Alert.alert('Aviso', 'Preencha todos os campos.');
      return;
    }
    const parsedDate = parseInputDate(newChildBirthDate, deviceFormat);
    if (!parsedDate) {
      Alert.alert('Erro', `Data inválida (${deviceFormat}).`);
      return;
    }
    const getSchedDate = (months: number) => {
      const d = new Date(parsedDate);
      d.setMonth(d.getMonth() + months);
      return d.toISOString().split('T')[0];
    };
    const newChild: Child = {
      id: Date.now().toString(36),
      name: newChildName,
      birthDate: parsedDate,
      gender: newChildGender,
      vaccines: require('../constants/vaccines').VACCINE_SCHEDULE.map((v: any) => ({
        vaccineId: v.id,
        status: 'pending',
        scheduledDate: getSchedDate(v.ageMonths)
      }))
    };
    setSelectedParentChildren(prev => [...prev, newChild]);
    setNewChildName('');
    setNewChildBirthDate('');
    setNewChildGender('male');
    setShowAddChildModal(false);
  };

  const toggleVaccine = (childId: string, vaccineId: string, currentStatus: string) => {
    if (currentStatus === 'completed') {
      setSelectedParentChildren(prev => prev.map(child => {
        if (child.id !== childId) return child;
        return { ...child, vaccines: child.vaccines.map(v => v.vaccineId !== vaccineId ? v : { ...v, status: 'pending', completedDate: undefined }) };
      }));
    } else {
      promptForDate(state.language === 'pt' ? 'pt' : 'en', (dateStr) => {
        setSelectedParentChildren(prev => prev.map(child => {
          if (child.id !== childId) return child;
          return { ...child, vaccines: child.vaccines.map(v => v.vaccineId !== vaccineId ? v : { ...v, status: 'completed', completedDate: dateStr }) };
        }));
      });
    }
  };

  const createBackup = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/backup`, { headers });
      const data = await res.json();
      Alert.alert(data.success ? 'Sucesso' : 'Erro', data.message || data.error);
    } catch (_) {
      Alert.alert('Erro', 'Falha ao criar backup.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.whatsapp.includes(userSearch)
  );

  const filteredChildren = children.filter(c =>
    c.name.toLowerCase().includes(childSearch.toLowerCase()) ||
    c.parentName.toLowerCase().includes(childSearch.toLowerCase())
  );

  const roleBadge = (role: string) => {
    const colors = { superadmin: '#7c3aed', admin: '#2563eb', parent: '#059669' };
    const labels = { superadmin: 'Super Admin', admin: 'Admin', parent: 'Encarregado' };
    return (
      <View style={[styles.roleBadge, { backgroundColor: (colors[role as keyof typeof colors] || '#666') + '18' }]}>
        <Text style={[styles.roleBadgeText, { color: colors[role as keyof typeof colors] || '#666' }]}>
          {labels[role as keyof typeof labels] || role}
        </Text>
      </View>
    );
  };

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'overview', icon: 'grid-outline', label: 'Visão Geral' },
    { key: 'users', icon: 'people-outline', label: 'Utilizadores' },
    { key: 'children', icon: 'body-outline', label: 'Crianças' },
    { key: 'audit', icon: 'document-text-outline', label: 'Auditoria' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? Colors.border.dark : Colors.border.light }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={isDark ? Colors.text.dark.primary : Colors.text.light.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
          Painel Super Admin
        </Text>
        <TouchableOpacity onPress={createBackup} style={[styles.backupBtn, { backgroundColor: primaryColor + '15' }]} activeOpacity={0.7}>
          <Ionicons name="cloud-download-outline" size={18} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: isDark ? Colors.border.dark : Colors.border.light }]}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.key ? primaryColor : (isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary)} />
            <Text style={[styles.tabLabel, { color: activeTab === tab.key ? primaryColor : (isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary) }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <View>
            {stats ? (
              <View style={styles.statsGrid}>
                {[
                  { icon: 'people', value: stats.totalUsers, label: 'Total Utilizadores', color: '#6366f1' },
                  { icon: 'person', value: stats.totalParents, label: 'Encarregados', color: '#059669' },
                  { icon: 'shield-checkmark', value: stats.totalAdmins, label: 'Admins', color: '#2563eb' },
                  { icon: 'star', value: stats.totalSuperadmins, label: 'Super Admins', color: '#7c3aed' },
                  { icon: 'body', value: stats.totalChildren, label: 'Crianças', color: '#f59e0b' },
                  { icon: 'checkmark-circle', value: stats.totalVaccinesCompleted, label: 'Vacinas Aplicadas', color: '#10b981' },
                  { icon: 'time', value: stats.totalVaccinesPending, label: 'Vacinas Pendentes', color: '#ef4444' },
                ].map((s, i) => (
                  <View key={i} style={[styles.statCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
                    <View style={[styles.statIconWrap, { backgroundColor: s.color + '15' }]}>
                      <Ionicons name={s.icon as any} size={22} color={s.color} />
                    </View>
                    <Text style={[styles.statValue, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>{s.value}</Text>
                    <Text style={[styles.statLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>{s.label}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 40 }} />
            )}

            {/* Quick Actions */}
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
              Acções Rápidas
            </Text>
            <View style={styles.quickActions}>
              {[
                { icon: 'people', label: 'Gerir Utilizadores', action: () => setActiveTab('users') },
                { icon: 'body', label: 'Gerir Crianças', action: () => setActiveTab('children') },
                { icon: 'color-palette', label: 'Definições de Marca', action: () => router.push('/branding') },
                { icon: 'document-text', label: 'Auditoria', action: () => setActiveTab('audit') },
              ].map((a, i) => (
                <TouchableOpacity key={i} style={[styles.quickAction, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]} onPress={a.action} activeOpacity={0.7}>
                  <Ionicons name={a.icon as any} size={24} color={primaryColor} />
                  <Text style={[styles.quickActionLabel, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ===== USERS TAB ===== */}
        {activeTab === 'users' && (
          <View>
            <View style={[styles.searchBar, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}>
              <Ionicons name="search" size={18} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} />
              <TextInput
                style={[styles.searchInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}
                placeholder="Pesquisar por nome ou WhatsApp..."
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                value={userSearch}
                onChangeText={setUserSearch}
              />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 30 }} />
            ) : (
              filteredUsers.map(user => (
                <View key={user.whatsapp} style={[styles.userCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
                  <View style={styles.userCardTop}>
                    <View style={[styles.userAvatar, { backgroundColor: primaryColor + '15' }]}>
                      <Ionicons name="person" size={20} color={primaryColor} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.userName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>{user.name}</Text>
                      <Text style={[styles.userMeta, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>{user.whatsapp}</Text>
                    </View>
                    {roleBadge(user.role)}
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6366f115' }]} onPress={() => { setSelectedUser(user); setShowRoleModal(true); }} activeOpacity={0.7}>
                      <Ionicons name="swap-horizontal" size={16} color="#6366f1" />
                      <Text style={[styles.actionBtnText, { color: '#6366f1' }]}>Papel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f59e0b15' }]} onPress={() => { setSelectedUser(user); setShowResetPwModal(true); }} activeOpacity={0.7}>
                      <Ionicons name="key" size={16} color="#f59e0b" />
                      <Text style={[styles.actionBtnText, { color: '#f59e0b' }]}>Senha</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#059669' + '15' }]} onPress={() => openParentChildren(user)} activeOpacity={0.7}>
                      <Ionicons name="folder-open" size={16} color="#059669" />
                      <Text style={[styles.actionBtnText, { color: '#059669' }]}>Dados</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef444415' }]} onPress={() => { setSelectedUser(user); setShowDeleteConfirm(true); }} activeOpacity={0.7}>
                      <Ionicons name="trash" size={16} color="#ef4444" />
                      <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ===== CHILDREN TAB ===== */}
        {activeTab === 'children' && (
          <View>
            <View style={[styles.searchBar, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}>
              <Ionicons name="search" size={18} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} />
              <TextInput
                style={[styles.searchInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}
                placeholder="Pesquisar criança ou encarregado..."
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                value={childSearch}
                onChangeText={setChildSearch}
              />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 30 }} />
            ) : (
              filteredChildren.map((child, idx) => {
                const pct = child.vaccinesTotal > 0 ? Math.round((child.vaccinesCompleted / child.vaccinesTotal) * 100) : 0;
                return (
                  <View key={`${child.id}-${idx}`} style={[styles.childCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
                    <View style={styles.childCardRow}>
                      <View style={[styles.childAvatar, { backgroundColor: child.gender === 'female' ? '#ec489915' : '#3b82f615' }]}>
                        <Ionicons name={child.gender === 'female' ? 'female' : 'male'} size={20} color={child.gender === 'female' ? '#ec4899' : '#3b82f6'} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.childName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>{child.name}</Text>
                        <Text style={[styles.childMeta, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                          {formatToDeviceDate(child.birthDate)} • Enc: {child.parentName}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.childPct, { color: pct === 100 ? '#059669' : primaryColor }]}>{pct}%</Text>
                        <Text style={[styles.childVax, { color: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary }]}>
                          {child.vaccinesCompleted}/{child.vaccinesTotal}
                        </Text>
                      </View>
                    </View>
                    {/* Progress bar */}
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: pct === 100 ? '#059669' : primaryColor }]} />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ===== AUDIT TAB ===== */}
        {activeTab === 'audit' && (
          <View>
            {loading ? (
              <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 30 }} />
            ) : audits.length === 0 ? (
              <Text style={[styles.emptyText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>Sem registos de auditoria.</Text>
            ) : (
              audits.map((a, i) => (
                <View key={a.id || i} style={[styles.auditCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
                  <View style={styles.auditRow}>
                    <View style={[styles.auditDot, { backgroundColor: a.action?.includes('delete') ? '#ef4444' : a.action?.includes('reset') ? '#f59e0b' : '#059669' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.auditAction, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>{a.action}</Text>
                      <Text style={[styles.auditPayload, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                        {a.entity_type}: {a.entity_id} {a.payload ? `• ${a.payload}` : ''}
                      </Text>
                    </View>
                    <Text style={[styles.auditDate, { color: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary }]}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ===== ROLE CHANGE MODAL ===== */}
      {showRoleModal && selectedUser && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowRoleModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
              <Text style={[styles.modalTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                Alterar Papel — {selectedUser.name}
              </Text>
              {(['parent', 'admin', 'superadmin'] as const).map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleOption, selectedUser.role === role && { backgroundColor: primaryColor + '15', borderColor: primaryColor }]}
                  onPress={() => changeUserRole(selectedUser.whatsapp, role)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={role === 'superadmin' ? 'star' : role === 'admin' ? 'shield-checkmark' : 'person'} size={20} color={selectedUser.role === role ? primaryColor : (isDark ? Colors.text.dark.secondary : Colors.text.light.secondary)} />
                  <Text style={[styles.roleOptionText, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                    {role === 'superadmin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'Encarregado'}
                  </Text>
                  {selectedUser.role === role && <Ionicons name="checkmark-circle" size={20} color={primaryColor} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowRoleModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ===== RESET PASSWORD MODAL ===== */}
      {showResetPwModal && selectedUser && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowResetPwModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
              <Text style={[styles.modalTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                Redefinir Senha — {selectedUser.name}
              </Text>
              <TextInput
                style={[styles.modalInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
                placeholder="Nova senha (mín. 6 caracteres)"
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity style={[styles.modalPrimaryBtn, { backgroundColor: primaryColor }]} onPress={resetUserPassword} activeOpacity={0.8}>
                <Text style={styles.modalPrimaryBtnText}>Redefinir Senha</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowResetPwModal(false); setNewPassword(''); }}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ===== DELETE CONFIRM MODAL ===== */}
      {showDeleteConfirm && selectedUser && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowDeleteConfirm(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
              <View style={[styles.dangerIcon, { backgroundColor: '#ef444415' }]}>
                <Ionicons name="warning" size={32} color="#ef4444" />
              </View>
              <Text style={[styles.modalTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, textAlign: 'center' }]}>
                Eliminar {selectedUser.name}?
              </Text>
              <Text style={[styles.modalSubtext, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                Esta acção é irreversível. Todos os dados do utilizador e das suas crianças serão eliminados permanentemente.
              </Text>
              <TouchableOpacity style={[styles.modalPrimaryBtn, { backgroundColor: '#ef4444' }]} onPress={deleteUser} activeOpacity={0.8}>
                <Text style={styles.modalPrimaryBtnText}>Sim, Eliminar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowDeleteConfirm(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ===== CHILD PANEL MODAL ===== */}
      {showChildPanel && selectedParent && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowChildPanel(false)}>
          <View style={[styles.childPanelContainer, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
            <View style={[styles.childPanelHeader, { borderBottomColor: isDark ? Colors.border.dark : Colors.border.light }]}>
              <TouchableOpacity onPress={() => setShowChildPanel(false)}>
                <Ionicons name="close" size={24} color={isDark ? Colors.text.dark.primary : Colors.text.light.primary} />
              </TouchableOpacity>
              <Text style={[styles.childPanelTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                Crianças de {selectedParent.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: '#059669' }]} onPress={() => setShowAddChildModal(true)}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallBtn, { backgroundColor: primaryColor }]} onPress={saveParentChildren}>
                  <Ionicons name="save" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {loadingChildren ? (
                <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 40 }} />
              ) : selectedParentChildren.length === 0 ? (
                <Text style={[styles.emptyText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>Sem crianças registadas.</Text>
              ) : (
                selectedParentChildren.map(child => {
                  const completed = child.vaccines?.filter(v => v.status === 'completed').length || 0;
                  const total = child.vaccines?.length || 0;
                  return (
                    <View key={child.id} style={[styles.childDetailCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
                      <Text style={[styles.childDetailName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>{child.name}</Text>
                      <Text style={[styles.childMeta, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                        {formatToDeviceDate(child.birthDate)} • {child.gender === 'female' ? 'F' : 'M'} • {completed}/{total} vacinas
                      </Text>
                      <View style={styles.vaccineList}>
                        {child.vaccines?.slice(0, 10).map(v => {
                          const vInfo = require('../constants/vaccines').VACCINE_SCHEDULE.find((vs: any) => vs.id === v.vaccineId);
                          return (
                            <TouchableOpacity
                              key={v.vaccineId}
                              style={styles.vaccineChip}
                              onPress={() => toggleVaccine(child.id, v.vaccineId, v.status)}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.vaccineChipDot, { backgroundColor: v.status === 'completed' ? '#059669' : '#e2e8f0' }]} />
                              <Text style={[styles.vaccineChipText, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                                {vInfo ? (state.language === 'pt' ? vInfo.namePt : vInfo.nameEn) : v.vaccineId}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                        {(child.vaccines?.length || 0) > 10 && (
                          <Text style={[styles.moreText, { color: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary }]}>
                            +{(child.vaccines?.length || 0) - 10} mais...
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>

          {/* Add Child Sub-Modal */}
          {showAddChildModal && (
            <Modal visible transparent animationType="fade" onRequestClose={() => setShowAddChildModal(false)}>
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
                  <Text style={[styles.modalTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>Adicionar Criança</Text>
                  <TextInput
                    style={[styles.modalInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
                    placeholder="Nome da criança"
                    placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                    value={newChildName}
                    onChangeText={setNewChildName}
                  />
                  <TextInput
                    style={[styles.modalInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
                    placeholder={`Data de nascimento (${deviceFormat})`}
                    placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                    value={newChildBirthDate}
                    onChangeText={(t) => setNewChildBirthDate(formatInputText(t, deviceFormat))}
                    keyboardType="numeric"
                  />
                  <View style={styles.genderRow}>
                    {(['male', 'female'] as const).map(g => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.genderBtn, newChildGender === g && { backgroundColor: primaryColor + '15', borderColor: primaryColor }]}
                        onPress={() => setNewChildGender(g)}
                      >
                        <Ionicons name={g === 'male' ? 'male' : 'female'} size={18} color={newChildGender === g ? primaryColor : '#999'} />
                        <Text style={{ color: newChildGender === g ? primaryColor : '#999', fontWeight: '600', marginLeft: 6 }}>
                          {g === 'male' ? 'Masculino' : 'Feminino'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={[styles.modalPrimaryBtn, { backgroundColor: primaryColor }]} onPress={handleAddChild} activeOpacity={0.8}>
                    <Text style={styles.modalPrimaryBtnText}>Adicionar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalCancel} onPress={() => setShowAddChildModal(false)}>
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  backupBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6 },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  // Quick actions
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAction: { width: '47%', borderRadius: 14, padding: 16, alignItems: 'center', gap: 8 },
  quickActionLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  // User card
  userCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  userCardTop: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 15, fontWeight: '700' },
  userMeta: { fontSize: 12, marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  userActions: { flexDirection: 'row', marginTop: 10, gap: 6, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionBtnText: { fontSize: 11, fontWeight: '700' },
  // Child card
  childCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  childCardRow: { flexDirection: 'row', alignItems: 'center' },
  childAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  childName: { fontSize: 14, fontWeight: '700' },
  childMeta: { fontSize: 11, marginTop: 2 },
  childPct: { fontSize: 16, fontWeight: '800' },
  childVax: { fontSize: 10, fontWeight: '600' },
  progressBarBg: { height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', marginTop: 10 },
  progressBarFill: { height: 4, borderRadius: 2 },
  // Audit
  auditCard: { borderRadius: 12, padding: 12, marginBottom: 8 },
  auditRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  auditDot: { width: 8, height: 8, borderRadius: 4 },
  auditAction: { fontSize: 13, fontWeight: '700' },
  auditPayload: { fontSize: 11, marginTop: 2 },
  auditDate: { fontSize: 10, fontWeight: '600' },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 30 },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 17, fontWeight: '800', marginBottom: 16 },
  modalSubtext: { fontSize: 13, textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  modalInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  modalPrimaryBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  modalPrimaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalCancel: { paddingVertical: 10, alignItems: 'center' },
  modalCancelText: { fontSize: 14, color: '#999', fontWeight: '600' },
  roleOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'transparent', marginBottom: 8 },
  roleOptionText: { flex: 1, fontSize: 14, fontWeight: '600' },
  dangerIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  // Child panel
  childPanelContainer: { flex: 1 },
  childPanelHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1, gap: 10 },
  childPanelTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
  smallBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  childDetailCard: { borderRadius: 14, padding: 14, marginBottom: 12 },
  childDetailName: { fontSize: 15, fontWeight: '700' },
  vaccineList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  vaccineChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#f1f5f9' },
  vaccineChipDot: { width: 6, height: 6, borderRadius: 3 },
  vaccineChipText: { fontSize: 10, fontWeight: '600' },
  moreText: { fontSize: 11, fontWeight: '600', paddingVertical: 4 },
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
});
