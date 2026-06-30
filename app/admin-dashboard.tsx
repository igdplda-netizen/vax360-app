import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, Child, PartnerBranding } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface ParentUser {
  whatsapp: string;
  name: string;
  email: string | null;
}

export default function AdminDashboardScreen() {
  const { state, API_BASE_URL, logout, t } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [parents, setParents] = useState<ParentUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedParent, setSelectedParent] = useState<ParentUser | null>(null);
  const [selectedParentChildren, setSelectedParentChildren] = useState<Child[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [savingChildren, setSavingChildren] = useState(false);

  // Modal to add a child to selected parent
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthDate, setNewChildBirthDate] = useState('');
  const [newChildGender, setNewChildGender] = useState<'male' | 'female' | 'other'>('male');

  useEffect(() => {
    if (state.token && state.userRole === 'superadmin') {
      loadParents();
    } else {
      router.replace('/login');
    }
  }, [state.token, state.userRole]);

  const loadParents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setParents(data.users);
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao carregar lista de encarregados.');
    }
    setLoading(false);
  };

  const selectParent = async (parent: ParentUser) => {
    setSelectedParent(parent);
    setLoadingChildren(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sync/${parent.whatsapp}`, {
        headers: { 'Authorization': `Bearer ${state.token}` }
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setSelectedParentChildren(data.data.children || []);
      } else {
        setSelectedParentChildren([]);
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao carregar crianças do encarregado.');
    }
    setLoadingChildren(false);
  };

  const handleSaveChildren = async () => {
    if (!selectedParent) return;
    setSavingChildren(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sync/${selectedParent.whatsapp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ children: selectedParentChildren })
      });
      if (res.ok) {
        Alert.alert('Sucesso', 'Registros salvos e sincronizados com sucesso.');
      } else {
        Alert.alert('Erro', 'Falha ao salvar registros.');
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro de conexão com o servidor.');
    }
    setSavingChildren(false);
  };

  const handleAddChild = () => {
    if (!newChildName || !newChildBirthDate) {
      Alert.alert('Aviso', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    // Calculate vaccine schedules
    const childBirth = newChildBirthDate;
    const getSchedDate = (months: number) => {
      const d = new Date(childBirth);
      d.setMonth(d.getMonth() + months);
      return d.toISOString().split('T')[0];
    };

    const newChild: Child = {
      id: Date.now().toString(36),
      name: newChildName,
      birthDate: newChildBirthDate,
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
    setSelectedParentChildren(prev => prev.map(child => {
      if (child.id !== childId) return child;
      return {
        ...child,
        vaccines: child.vaccines.map(v => {
          if (v.vaccineId !== vaccineId) return v;
          return {
            ...v,
            status: currentStatus === 'completed' ? 'pending' : 'completed',
            completedDate: currentStatus === 'completed' ? undefined : new Date().toISOString().split('T')[0]
          };
        })
      };
    }));
  };

  const filteredParents = parents.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.whatsapp.includes(search)
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
          Painel Clínico
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: Colors.primary }]} onPress={() => router.push('/branding')} activeOpacity={0.8}>
            <Ionicons name="color-palette-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navBtn, { backgroundColor: Colors.danger }]} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Left Side: Parents List */}
        <View style={[styles.panelLeft, { borderColor: isDark ? Colors.border.dark : Colors.border.light }]}>
          <View style={[styles.searchWrapper, { borderColor: isDark ? Colors.border.dark : Colors.border.light }]}>
            <Ionicons name="search" size={18} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}
              placeholder="Buscar por nome ou WhatsApp..."
              placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
              {filteredParents.map(parent => (
                <TouchableOpacity
                  key={parent.whatsapp}
                  style={[
                    styles.parentCard,
                    { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light },
                    selectedParent?.whatsapp === parent.whatsapp && styles.parentCardActive
                  ]}
                  onPress={() => selectParent(parent)}
                  activeOpacity={0.7}
                >
                  <View style={styles.parentAvatar}>
                    <Ionicons name="person" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.parentInfo}>
                    <Text style={[styles.parentName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                      {parent.name}
                    </Text>
                    <Text style={[styles.parentMeta, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                      WhatsApp: {parent.whatsapp}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Right Side: Selected Parent children & vaccines details */}
        <View style={styles.panelRight}>
          {selectedParent ? (
            <View style={{ flex: 1 }}>
              <View style={styles.parentHeader}>
                <View>
                  <Text style={[styles.parentTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                    {selectedParent.name}
                  </Text>
                  <Text style={[styles.parentSub, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                    WhatsApp: {selectedParent.whatsapp} {selectedParent.email ? `• ${selectedParent.email}` : ''}
                  </Text>
                </View>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
                    onPress={() => setShowAddChildModal(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Registrar Criança</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                    onPress={handleSaveChildren}
                    disabled={savingChildren}
                    activeOpacity={0.8}
                  >
                    {savingChildren ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload" size={18} color="#fff" />
                        <Text style={styles.actionBtnText}>Salvar Alterações</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {loadingChildren ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 80 }} />
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.childrenContainer}>
                  {selectedParentChildren.map(child => (
                    <View key={child.id} style={[styles.childSection, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
                      <View style={styles.childHeader}>
                        <View style={[styles.avatar, { backgroundColor: child.gender === 'female' ? '#fce7f3' : '#dbeafe' }]}>
                          <Ionicons
                            name={child.gender === 'female' ? 'female' : child.gender === 'male' ? 'male' : 'person'}
                            size={20}
                            color={child.gender === 'female' ? '#ec4899' : '#3b82f6'}
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[styles.childName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                            {child.name}
                          </Text>
                          <Text style={[styles.childMeta, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                            Nascimento: {child.birthDate} ({child.gender})
                          </Text>
                        </View>
                      </View>

                      {/* Vaccines List */}
                      <View style={styles.vaccinesList}>
                        {child.vaccines.map(v => (
                          <TouchableOpacity
                            key={v.vaccineId}
                            style={[styles.vaxRow, { borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
                            onPress={() => toggleVaccine(child.id, v.vaccineId, v.status)}
                            activeOpacity={0.6}
                          >
                            <Text style={[styles.vaxName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                              {v.vaccineId}
                            </Text>
                            <View style={styles.vaxStatusContainer}>
                              <Text style={[styles.vaxDate, { color: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary }]}>
                                {v.completedDate ? `Aplicada: ${v.completedDate}` : `Agendada: ${v.scheduledDate}`}
                              </Text>
                              <Ionicons
                                name={v.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                                size={22}
                                color={v.status === 'completed' ? Colors.success : Colors.primary}
                              />
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="people-outline" size={48} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} />
              <Text style={[styles.placeholderText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                Selecione um encarregado na barra lateral para gerir os seus registros.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Add Child Dialog Modal */}
      {showAddChildModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
            <Text style={[styles.modalTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
              Registrar Nova Criança
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                Nome
              </Text>
              <TextInput
                style={[styles.modalInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
                placeholder="Nome da criança"
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                value={newChildName}
                onChangeText={setNewChildName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                Data de Nascimento
              </Text>
              <TextInput
                style={[styles.modalInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                value={newChildBirthDate}
                onChangeText={setNewChildBirthDate}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                Género
              </Text>
              <View style={styles.genderRow}>
                {['male', 'female', 'other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderBtn,
                      { borderColor: isDark ? Colors.border.dark : Colors.border.light },
                      newChildGender === g && { backgroundColor: Colors.primary, borderColor: Colors.primary }
                    ]}
                    onPress={() => setNewChildGender(g as any)}
                  >
                    <Text style={[styles.genderBtnText, newChildGender === g && { color: '#fff' }]}>
                      {g === 'male' ? 'Masc' : g === 'female' ? 'Fem' : 'Outro'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowAddChildModal(false)}>
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalAddBtn, { backgroundColor: Colors.primary }]} onPress={handleAddChild}>
                <Text style={styles.modalAddBtnText}>Registrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerRight: { flexDirection: 'row', gap: 8 },
  navBtn: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, flexDirection: 'row' },
  panelLeft: { width: '35%', borderRightWidth: 1, padding: 16 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 14, fontWeight: '600' },
  listContainer: { gap: 10 },
  parentCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12 },
  parentCardActive: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  parentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(99,102,241,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  parentInfo: { flex: 1 },
  parentName: { fontSize: 14, fontWeight: '700' },
  parentMeta: { fontSize: 11, marginTop: 2 },
  panelRight: { flex: 1, padding: 20 },
  placeholderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  placeholderText: { fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  parentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', marginBottom: 16 },
  parentTitle: { fontSize: 20, fontWeight: '800' },
  parentSub: { fontSize: 13, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, gap: 6 },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  childrenContainer: { gap: 16 },
  childSection: { padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  childHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  childName: { fontSize: 16, fontWeight: '800' },
  childMeta: { fontSize: 12, marginTop: 2 },
  vaccinesList: { gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
  vaxRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5 },
  vaxName: { fontSize: 13, fontWeight: '700' },
  vaxStatusContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vaxDate: { fontSize: 11 },
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { width: '80%', padding: 24, borderRadius: 20, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontWeight: '600' },
  genderRow: { flexDirection: 'row', gap: 8 },
  genderBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  genderBtnText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelBtnText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
  modalAddBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  modalAddBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' }
});
