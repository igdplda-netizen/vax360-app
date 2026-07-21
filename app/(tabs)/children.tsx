import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { formatToDeviceDate } from '../../utils/date';
import { shadows } from '../../utils/shadows';

export default function ChildrenScreen() {
  const { state, t, removeChild, setCurrentChild } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  useEffect(() => {
    if (!state.token) {
      router.replace('/login');
    }
  }, [state.token]);

  if (!state.token) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Child',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeChild(id) },
      ]
    );
  };

  const handleSelect = (id: string) => {
    setCurrentChild(id);
    router.push('/(tabs)');
  };

  const getAge = (birthDate: string) => {
    const now = new Date();
    const birth = new Date(birthDate);
    let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (now.getDate() < birth.getDate()) months--;
    if (months < 0) months = 0;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years > 0) return `${years}y ${remainingMonths}m`;
    return `${months}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
            {t('children')}
          </Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: Colors.primary }]} onPress={() => router.push('/add-child')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {state.children.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: Colors.primary + '12' }]}>
              <Ionicons name="people-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
              {t('noChildren')}
            </Text>
            <Text style={[styles.emptyDesc, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              {t('addFirstChild')}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {state.children.map(child => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childCard,
                  { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light },
                  state.currentChildId === child.id && styles.childCardActive,
                ]}
                onPress={() => handleSelect(child.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.avatar, { backgroundColor: child.gender === 'female' ? '#fce7f3' : '#dbeafe' }]}>
                  <Ionicons
                    name={child.gender === 'female' ? 'female' : child.gender === 'male' ? 'male' : 'person'}
                    size={24}
                    color={child.gender === 'female' ? '#ec4899' : '#3b82f6'}
                  />
                </View>
                <View style={styles.childInfo}>
                  <Text style={[styles.childName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                    {child.name}
                  </Text>
                  <Text style={[styles.childMeta, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                    {getAge(child.birthDate)} • {formatToDeviceDate(child.birthDate)}
                  </Text>
                </View>
                {state.currentChildId === child.id && (
                  <View style={[styles.activeBadge, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(child.id, child.name)}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 12 },
  childCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    ...shadows.sm(),
  },
  childCardActive: { borderWidth: 2, borderColor: Colors.primary },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  childInfo: { flex: 1 },
  childName: { fontSize: 17, fontWeight: '700' },
  childMeta: { fontSize: 13, marginTop: 2 },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  activeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  deleteBtn: { padding: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', color: Colors.text.light.secondary },
});
