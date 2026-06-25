// Complaints — admin-only management of user feedback. Filter by status,
// set a new status, and reply.
import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import api from '../api/client';
import Button from '../components/Button';
import Pill from '../components/Pill';
import { colors, fonts, spacing, radius, shadow } from '../theme';

const FILTERS = ['all', 'open', 'seen', 'in_progress', 'resolved'];
const STATUSES = ['open', 'seen', 'in_progress', 'resolved'];
const LABEL = { all: 'All', open: 'Open', seen: 'Seen', in_progress: 'In progress', resolved: 'Resolved' };
function fmtDate(d) {
  try { return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

function ComplaintRow({ c, onSaved }) {
  const [status, setStatus] = useState(c.status);
  const [response, setResponse] = useState(c.admin_response || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/complaints/${c.complaint_id}`, { status, admin_response: response });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.title}>{c.subject}</Text>
        <Pill label={LABEL[c.status] || c.status} tone={c.status} />
      </View>
      <Text style={styles.meta}>From {c.user_name} ({c.user_role}) · {fmtDate(c.created_at)}{c.project_title ? ` · re: ${c.project_title}` : ''}</Text>
      <Text style={styles.body}>{c.message}</Text>

      <Text style={styles.label}>Set status</Text>
      <View style={styles.statusRow}>
        {STATUSES.map((s) => (
          <Pressable key={s} style={[styles.statusChip, status === s && styles.statusChipActive]} onPress={() => setStatus(s)}>
            <Text style={[styles.statusChipText, status === s && styles.statusChipTextActive]}>{LABEL[s]}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: spacing.md }]}>Response to the user</Text>
      <TextInput style={[styles.input, styles.textarea]} value={response} onChangeText={setResponse}
        placeholder="Optional reply the user will see…" placeholderTextColor={colors.inkFaint} multiline />
      <Button title="Save" variant="gold" small onPress={save} loading={saving} style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
    </View>
  );
}

export default function ComplaintsScreen() {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/complaints', { params: { status: filter } });
      setItems(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load complaints.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.flex}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{LABEL[f]}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <View style={styles.alert}><Text style={styles.alertText}>{error}</Text></View> : null}
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} size="large" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.complaint_id)}
          renderItem={({ item }) => <ComplaintRow c={item} onSaved={load} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>No {filter === 'all' ? '' : LABEL[filter].toLowerCase()} complaints.</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.surfaceEdge, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 7, backgroundColor: colors.surface, alignSelf: 'flex-start' },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkSoft },
  chipTextActive: { color: colors.white },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  empty: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkFaint, textAlign: 'center' },
  listContent: { padding: spacing.xl, paddingTop: spacing.sm, flexGrow: 1 },
  alert: { backgroundColor: colors.dangerWash, marginHorizontal: spacing.xl, borderRadius: radius.sm, padding: spacing.md },
  alertText: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 14 },

  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceEdge, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, ...shadow.card },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  title: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink, flex: 1 },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: colors.inkFaint, marginBottom: spacing.sm },
  body: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: spacing.md },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.inkSoft, marginBottom: 7 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusChip: { borderWidth: 1, borderColor: colors.surfaceEdge, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6, backgroundColor: colors.parchment },
  statusChipActive: { backgroundColor: colors.goldWash, borderColor: colors.gold },
  statusChipText: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.inkSoft },
  statusChipTextActive: { color: colors.goldDeep },
  input: { backgroundColor: colors.parchment, borderWidth: 1, borderColor: colors.surfaceEdge, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: 12, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.ink },
  textarea: { minHeight: 70, textAlignVertical: 'top' },
});
