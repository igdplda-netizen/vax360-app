import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { VaccineStatus } from '../../context/AppContext';
import { VACCINE_SCHEDULE } from '../../constants/vaccines';

export default function HomeScreen() {
  const { state, t, getVaccinesForChild } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const currentChild = state.children.find(c => c.id === state.currentChildId);

  if (state.children.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
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
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-child')} activeOpacity={0.8}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{t('addChild')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const vaccines = currentChild ? getVaccinesForChild(currentChild) : [];
  const completed = vaccines.filter(v => v.status === 'completed').length;
  const overdue = vaccines.filter(v => v.status === 'overdue').length;
  const upcoming = vaccines.filter(v => v.status === 'upcoming').length;
  const total = VACCINE_SCHEDULE.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getStatusColor = (status: VaccineStatus) => {
    switch (status) {
      case 'completed': return Colors.vaccine.completed;
      case 'overdue': return Colors.vaccine.overdue;
      case 'upcoming': return Colors.vaccine.upcoming;
      default: return Colors.vaccine.pending;
    }
  };

  const getStatusIcon = (status: VaccineStatus) => {
    switch (status) {
      case 'completed': return 'checkmark-circle' as const;
      case 'overdue': return 'alert-circle' as const;
      case 'upcoming': return 'time' as const;
      default: return 'ellipse' as const;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              {t('appName')}
            </Text>
            <Text style={[styles.title, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
              {currentChild?.name || t('home')}
            </Text>
          </View>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: Colors.primary }]} onPress={() => router.push('/add-child')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
              {t('progress')}
            </Text>
            <Text style={[styles.progressPercent, { color: Colors.primary }]}>{progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: Colors.primary }]} />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.vaccine.completed }]}>{completed}</Text>
              <Text style={[styles.statLabel, { color: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary }]}>
                {t('completed')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.vaccine.upcoming }]}>{upcoming}</Text>
              <Text style={[styles.statLabel, { color: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary }]}>
                {t('upcoming')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.vaccine.overdue }]}>{overdue}</Text>
              <Text style={[styles.statLabel, { color: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary }]}>
                {t('overdue')}
              </Text>
            </View>
          </View>
        </View>

        {/* Child Selector */}
        {state.children.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childSelector} contentContainerStyle={styles.childSelectorContent}>
            {state.children.map(child => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childChip,
                  { backgroundColor: state.currentChildId === child.id ? Colors.primary : isDark ? Colors.surface.dark : Colors.surface.light },
                ]}
                onPress={() => {/* setCurrentChild(child.id) */}}
              >
                <Text style={[styles.childChipText, { color: state.currentChildId === child.id ? '#fff' : isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Upcoming Vaccines */}
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
          {t('schedule')}
        </Text>
        {vaccines.filter(v => v.status === 'upcoming' || v.status === 'overdue').length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
            <Ionicons name="checkmark-circle" size={40} color={Colors.vaccine.completed} />
            <Text style={[styles.emptyCardText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              {t('allCaughtUp')}
            </Text>
          </View>
        ) : (
          <View style={styles.vaccineList}>
            {vaccines
              .filter(v => v.status === 'upcoming' || v.status === 'overdue')
              .slice(0, 5)
              .map(v => (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.vaccineCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}
                  onPress={() => router.push({ pathname: '/vaccine-detail', params: { childId: currentChild?.id, vaccineId: v.id } })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.vaccineIcon, { backgroundColor: getStatusColor(v.status) + '15' }]}>
                    <Ionicons name={getStatusIcon(v.status)} size={22} color={getStatusColor(v.status)} />
                  </View>
                  <View style={styles.vaccineInfo}>
                    <Text style={[styles.vaccineName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                      {state.language === 'pt' ? v.namePt : v.nameEn}
                    </Text>
                    <Text style={[styles.vaccineDate, { color: getStatusColor(v.status) }]}>
                      {v.scheduledDate}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} />
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
  greeting: { fontSize: 14, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800', marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  progressCard: { borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 16, fontWeight: '700' },
  progressPercent: { fontSize: 20, fontWeight: '800' },
  progressBarBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#e2e8f0' },
  childSelector: { marginBottom: 16 },
  childSelectorContent: { gap: 8, paddingRight: 20 },
  childChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  childChipText: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 4 },
  vaccineList: { gap: 10 },
  vaccineCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  vaccineIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  vaccineInfo: { flex: 1 },
  vaccineName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  vaccineDate: { fontSize: 13, fontWeight: '500' },
  emptyCard: { alignItems: 'center', padding: 40, borderRadius: 20 },
  emptyCardText: { fontSize: 15, marginTop: 12, textAlign: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptyDesc: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  addButton: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, gap: 8,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
