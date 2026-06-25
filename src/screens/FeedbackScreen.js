// Feedback — any signed-in user can report an issue / send feedback to the
// administrator and track the status of their submissions.
import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../api/client';
import Button from '../components/Button';
import Pill from '../components/Pill';
import { colors, fonts, spacing, radius, shadow } from '../theme';

const STATUS_LABEL = { open: 'open', seen: 'seen', in_progress: 'in progress', resolved: 'resolved' };
function fmtDate(d) {
  try { return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

export default function FeedbackScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints/mine');
      setItems(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your feedback.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setError(''); setNotice('');
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both a subject and a message.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/complaints', { subject, message });
      setNotice(res.data?.message || 'Submitted.');
      setSubject(''); setMessage('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.lead}>Report an issue or send feedback. Your message goes straight to the administrator.</Text>

        {notice ? <View style={styles.notice}><Text style={styles.noticeText}>{notice}</Text></View> : null}

        <View style={styles.card}>
          <Text style={styles.label}>Subject</Text>
          <TextInput style={styles.input} value={subject} onChangeText={setSubject}
            placeholder="e.g. A project link is broken" placeholderTextColor={colors.inkFaint} maxLength={200} />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Message</Text>
          <TextInput style={[styles.input, styles.textarea]} value={message} onChangeText={setMessage}
            placeholder="Describe the problem or suggestion…" placeholderTextColor={colors.inkFaint} multiline />
          <Button title="Send to administrator" variant="gold" onPress={submit} loading={submitting} style={{ marginTop: spacing.lg }} />
          {error ? <View style={styles.alert}><Text style={styles.alertText}>{error}</Text></View> : null}
        </View>

        <Text style={styles.sectionTitle}>Your previous feedback</Text>
        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>Anything you submit will appear here with its status.</Text>
        ) : (
          items.map((c) => (
            <View key={c.complaint_id} style={styles.item}>
              <View style={styles.itemHead}>
                <Text style={styles.itemTitle}>{c.subject}</Text>
                <Pill label={STATUS_LABEL[c.status] || c.status} tone={c.status} />
              </View>
              <Text style={styles.meta}>Submitted {fmtDate(c.created_at)}{c.project_title ? ` · re: ${c.project_title}` : ''}</Text>
              <Text style={styles.body}>{c.message}</Text>
              {c.admin_response ? (
                <View style={styles.resp}><Text style={styles.respText}>
                  <Text style={{ fontFamily: fonts.bodySemiBold }}>Admin response: </Text>{c.admin_response}
                </Text></View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  lead: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkSoft, marginBottom: spacing.lg, lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceEdge, borderRadius: radius.md, padding: spacing.lg, ...shadow.card },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.inkSoft, marginBottom: 7 },
  input: {
    backgroundColor: colors.parchment, borderWidth: 1, borderColor: colors.surfaceEdge, borderRadius: radius.sm,
    paddingHorizontal: spacing.lg, paddingVertical: 12, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.ink,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  notice: { backgroundColor: colors.tealWash, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.lg },
  noticeText: { fontFamily: fonts.bodyMedium, color: colors.teal, fontSize: 14 },
  alert: { backgroundColor: colors.dangerWash, borderRadius: radius.sm, padding: spacing.md, marginTop: spacing.md },
  alertText: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 14 },

  sectionTitle: { fontFamily: fonts.displaySemiBold, fontSize: 18, color: colors.ink, marginTop: spacing.xxl, marginBottom: spacing.md },
  empty: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkFaint, marginTop: spacing.sm },
  item: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceEdge, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, ...shadow.card },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  itemTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink, flex: 1 },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: colors.inkFaint, marginBottom: spacing.sm },
  body: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkSoft, lineHeight: 20 },
  resp: { marginTop: spacing.md, backgroundColor: colors.goldWash, borderRadius: radius.sm, padding: spacing.md },
  respText: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.goldDeep },
});
