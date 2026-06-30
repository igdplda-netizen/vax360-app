import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, useColorScheme, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function AddChildScreen() {
  const { t, addChild } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!birthDate.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      Alert.alert('Error', 'Please enter a valid date (YYYY-MM-DD)');
      return;
    }

    addChild({ name: name.trim(), birthDate, gender });
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? Colors.text.dark.primary : Colors.text.light.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
          {t('addChild')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={[styles.label, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {t('childName')}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light, color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Maria Silva"
            placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {t('birthDate')}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light, color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}

            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {t('gender')}
          </Text>
          <View style={styles.genderRow}>
            {(['male', 'female', 'other'] as const).map(g => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderBtn,
                  gender === g && { backgroundColor: Colors.primary },
                  { backgroundColor: gender === g ? Colors.primary : isDark ? Colors.surface.dark : Colors.surface.light },
                ]}
                onPress={() => setGender(g)}
              >
                <Ionicons
                  name={g === 'male' ? 'male' : g === 'female' ? 'female' : 'person'}
                  size={18}
                  color={gender === g ? '#fff' : isDark ? Colors.text.dark.secondary : Colors.text.light.secondary}
                />
                <Text style={[styles.genderText, { color: gender === g ? '#fff' : isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                  {t(g)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveBtnText}>{t('save')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  form: { paddingHorizontal: 20, gap: 20 },
  field: {},
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  input: { paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, fontSize: 16, fontWeight: '500' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flex: 1, justifyContent: 'center' },
  genderText: { fontSize: 14, fontWeight: '600' },
  saveBtn: { marginHorizontal: 20, marginTop: 32, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
