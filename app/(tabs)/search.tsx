import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, useColorScheme, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { VACCINE_SCHEDULE } from '../../constants/vaccines';
import { shadows } from '../../utils/shadows';

const CATEGORY_COLORS = {
  mandatory:   { bg: '#dbeafe', text: '#1e40af', icon: 'shield-checkmark' as const },
  recommended: { bg: '#fef3c7', text: '#92400e', icon: 'star' as const },
  travel:      { bg: '#e0e7ff', text: '#3730a3', icon: 'airplane' as const },
};

export default function SearchScreen() {
  const { t, state } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const isPt = state.language === 'pt';

  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VACCINE_SCHEDULE;
    return VACCINE_SCHEDULE.filter(v => {
      const name = (isPt ? v.namePt : v.nameEn).toLowerCase();
      const desc = (isPt ? v.descriptionPt : v.description).toLowerCase();
      const age  = (isPt ? v.ageLabelPt : v.ageLabel).toLowerCase();
      return name.includes(q) || desc.includes(q) || age.includes(q);
    });
  }, [query, isPt]);

  const renderItem = ({ item: v }: { item: typeof VACCINE_SCHEDULE[0] }) => {
    const cat = CATEGORY_COLORS[v.category] || CATEGORY_COLORS.mandatory;
    const name = isPt ? v.namePt : v.nameEn;
    const age  = isPt ? v.ageLabelPt : v.ageLabel;
    const categoryLabel = t(
      v.category === 'mandatory' ? 'mandatoryVaccines'
      : v.category === 'recommended' ? 'recommendedVaccines'
      : 'travelVaccines'
    );

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}
        onPress={() => router.push(`/vaccine-info?vaccineId=${v.id}`)}
        activeOpacity={0.75}
      >
        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: cat.bg }]}>
          <Ionicons name={cat.icon} size={22} color={cat.text} />
        </View>

        {/* Info */}
        <View style={styles.cardBody}>
          <Text style={[styles.vaccineName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="timer-outline" size={13} color={Colors.primary} />
            <Text style={[styles.metaText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              {age}
            </Text>
          </View>
          <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
            <Text style={[styles.catText, { color: cat.text }]}>{categoryLabel}</Text>
          </View>
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={18} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
          {t('searchVaccines')}
        </Text>
        <Text style={[styles.headerSub, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
          {t('searchVaccinesSub')}
        </Text>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light, ...shadows.sm() }]}>
        <Ionicons name="search" size={19} color={Colors.primary} />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Count */}
      <Text style={[styles.countLabel, { color: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary }]}>
        {results.length} {t('vaccinesFound')}
      </Text>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={v => v.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={Colors.primary + '55'} />
            <Text style={[styles.emptyText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              {t('noVaccinesFound')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2, fontWeight: '500' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 14, marginBottom: 4,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },

  countLabel: { fontSize: 12, fontWeight: '600', marginHorizontal: 20, marginBottom: 10, marginTop: 6 },

  list: { paddingHorizontal: 20, paddingBottom: 40 },

  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 16, marginBottom: 10, gap: 12, ...shadows.sm(),
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 4 },
  vaccineName: { fontSize: 15, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '500' },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  catText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
});
