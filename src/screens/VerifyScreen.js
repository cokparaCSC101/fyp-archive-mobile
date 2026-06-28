// Email verification screen. Reached after registering, or after a login
// attempt on an unverified account. Enter the emailed 6-digit code to
// confirm the account and sign in.
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

export default function VerifyScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { verifyEmail, resendCode } = useAuth();
  const [email, setEmail] = useState(route.params?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(route.params?.email ? 'We sent a 6-digit code to your email.' : '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const insets = useSafeAreaInsets();

  const handleVerify = async () => {
    setError('');
    setInfo('');
    if (!email || code.length !== 6) {
      setError('Enter your email and the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email.trim(), code.trim());
      // On success the navigator swaps to the app stack automatically.
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setResending(true);
    try {
      const data = await resendCode(email.trim());
      setInfo(data.message || 'A new code has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend the code.');
    } finally {
      setResending(false);
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
        <Text style={styles.heading}>Verify your email</Text>
        <Text style={styles.sub}>Enter the 6-digit code we emailed you.</Text>

        {error ? (
          <View style={styles.alert}>
            <Text style={styles.alertText}>{error}</Text>
          </View>
        ) : null}
        {info ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{info}</Text>
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
          <Text style={styles.label}>Verification code</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            placeholderTextColor={colors.inkFaint}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <Button title="Verify & continue" onPress={handleVerify} loading={loading} style={{ marginTop: spacing.sm }} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Didn't get it? </Text>
          <Pressable onPress={handleResend} disabled={resending}>
            <Text style={styles.footerLink}>{resending ? 'Sending…' : 'Resend code'}</Text>
          </Pressable>
        </View>
        <View style={styles.footer}>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Back to sign in</Text>
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
  alert: { backgroundColor: colors.dangerWash, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.lg },
  alertText: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 14 },
  notice: { backgroundColor: colors.tealWash, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.lg },
  noticeText: { fontFamily: fonts.bodyMedium, color: colors.teal, fontSize: 14 },
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
  codeInput: { letterSpacing: 8, fontSize: 22, textAlign: 'center', fontFamily: fonts.bodySemiBold },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  footerText: { fontFamily: fonts.bodyRegular, color: colors.inkFaint, fontSize: 14 },
  footerLink: { fontFamily: fonts.bodySemiBold, color: colors.goldDeep, fontSize: 14 },
});
