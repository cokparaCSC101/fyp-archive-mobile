// Registration screen. New accounts default to read-only roles.
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { colors, fonts, spacing, radius } from '../theme';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'hod', label: 'Head of Dept.' },
];

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { register } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    setError('');
    if (!form.full_name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim() });
      navigation.navigate('Verify', { email: form.email.trim() });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.sub}>Register to start browsing the archive.</Text>

        {error ? (
          <View style={styles.alert}>
            <Text style={styles.alertText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={form.full_name}
            onChangeText={(v) => setField('full_name', v)}
            placeholder="Your full name"
            placeholderTextColor={colors.inkFaint}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(v) => setField('email', v)}
            placeholder="you@pau.edu.ng"
            placeholderTextColor={colors.inkFaint}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={form.password}
            onChangeText={(v) => setField('password', v)}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.inkFaint}
            secureTextEntry
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map((r) => {
              const active = form.role === r.value;
              return (
                <Pressable
                  key={r.value}
                  onPress={() => setField('role', r.value)}
                  style={[styles.roleChip, active && styles.roleChipActive]}
                >
                  <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button title="Create account" onPress={handleRegister} loading={loading} style={{ marginTop: spacing.sm }} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  container: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  heading: { fontFamily: fonts.displaySemiBold, fontSize: 30, color: colors.ink, marginBottom: 4 },
  sub: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.inkFaint, marginBottom: spacing.xl },
  alert: {
    backgroundColor: colors.dangerWash,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  alertText: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 14 },
  field: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.inkSoft, marginBottom: 7 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceEdge,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.ink,
  },
  roleRow: { flexDirection: 'row', gap: spacing.sm },
  roleChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.surfaceEdge,
    borderRadius: radius.sm,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  roleChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  roleChipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkSoft },
  roleChipTextActive: { color: colors.white },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontFamily: fonts.bodyRegular, color: colors.inkFaint, fontSize: 14 },
  footerLink: { fontFamily: fonts.bodySemiBold, color: colors.goldDeep, fontSize: 14 },
});
