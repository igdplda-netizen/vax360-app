import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { VaccineStatus } from '../../context/AppContext';

const groups = [
  { key: 'birth', label: 'Ao Nascer', labelEn: 'At Birth' },
  { key: '2m', label: '2 meses', labelEn: '2 months' },
  { key: '3m', label: '3 meses', labelEn: '3 months' },
  { key: '4m', label: '4 meses', labelEn: '4 months' },
  { key: '5m', label: '5 meses', labelEn: '5 months' },
  { key: '6m', label: '6 meses', labelEn: '6 months' },
  { key: '9m', label: '9 meses', labelEn: '9 months' },
  { key: '12m', label: '12 meses', labelEn: '12 months' },
  { key: '15m', label: '15 meses', labelEn: '15 months' },
  { key: '18m', label: '18 meses', labelEn: '18 months' },
];

export default function ScheduleScreen() {
  const { state, t, getVaccinesForChild, markVaccineCompleted, markVaccinePending } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const currentChild = state.children.find(c => c.id === state.currentChildId);

  if (!currentChild) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }}>
          {t('noChildren')}
        </Text>
      </View>
    );
  }

  const vaccines = getVaccinesForChild(currentChild);

  const getStatusColor = (status: VaccineStatus) => {
    switch (status) {
      case 'completed': return Colors.vaccine.completed;
      case 'overdue': return Colors.vaccine.overdue;
      case 'upcoming': return Colors.vaccine.upcoming;
      default: return Colors.vaccine.pending;
    }
  };

  const handleToggle = (vaccineId: string, currentStatus: VaccineStatus) => {
    if (currentStatus === 'completed') {
      markVaccinePending(currentChild.id, vaccineId);
    } else {
      markVaccineCompleted(currentChild.id, vaccineId);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
          {currentChild.name} — {t('schedule')}
        </Text>

        {groups.map(group => {
          const groupVaccines = vaccines.filter(v => v.group === group.key);
          if (groupVaccines.length === 0) return null;

          return (
            <View key={group.key} style={styles.group}>
              <Text style={[styles.groupLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                {state.language === 'pt' ? group.label : group.labelEn}
              </Text>
              <View style={[styles.groupCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
                {groupVaccines.map((v, idx) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.vaccineRow, idx < groupVaccines.length - 1 && styles.vaccineRowBorder]}
                    onPress={() => handleToggle(v.id, v.status)}
                    activeOpacity={0.6}
                  >
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(v.status) }]} />
                    <View style={styles.vaccineInfo}>
                      <Text style={[styles.vaccineName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                        {state.language === 'pt' ? v.namePt : v.nameEn}
                      </Text>
                      <Text style={[styles.vaccineStatus, { color: getStatusColor(v.status) }]}>
                        {v.status === 'completed' ? t('completed') : v.scheduledDate}
                      </Text>
                    </View>
                    {v.status === 'completed' ? (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.vaccine.completed} />
                    ) : (
                      <View style={[styles.checkbox, { borderColor: isDark ? Colors.border.dark : Colors.border.light }]} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  headerTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  group: { marginBottom: 16 },
  groupLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  groupCard: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  vaccineRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  vaccineRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  vaccineInfo: { flex: 1 },
  vaccineName: { fontSize: 15, fontWeight: '600' },
  vaccineStatus: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2 },
});
