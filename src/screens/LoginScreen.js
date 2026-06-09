// Login screen
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
import { colors, fonts, spacing, radius } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      // On success, the navigator swaps to the app stack automatically.
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please try again.');
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
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>A</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>FYP Archive</Text>
            <Text style={styles.brandSub}>PAN-ATLANTIC UNIVERSITY</Text>
          </View>
        </View>

        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to access the project archive.</Text>

        {error ? (
          <View style={styles.alert}>
            <Text style={styles.alertText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
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
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.inkFaint}
            secureTextEntry
          />
        </View>

        <Button title="Sign in" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Create one</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  container: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xxl },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: { fontFamily: fonts.displaySemiBold, color: colors.gold, fontSize: 22 },
  brandTitle: { fontFamily: fonts.displaySemiBold, fontSize: 18, color: colors.ink },
  brandSub: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.inkFaint, letterSpacing: 1 },

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

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontFamily: fonts.bodyRegular, color: colors.inkFaint, fontSize: 14 },
  footerLink: { fontFamily: fonts.bodySemiBold, color: colors.goldDeep, fontSize: 14 },
});
