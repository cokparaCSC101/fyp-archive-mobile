// Audit Log — admin/HoD view of who did what across the archive.
import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import api from '../api/client';
import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { colors, fonts, spacing, radius } from '../theme';

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'view_project', label: 'Views' },
  { key: 'create_project', label: 'Uploads' },
  { key: 'update_project', label: 'Edits' },
  { key: 'delete_project', label: 'Deletions' },
  { key: 'approve_create', label: 'Approvals' },
];
const ACTION_TEXT = {
  view_project: 'viewed', create_project: 'uploaded', update_project: 'edited', delete_project: 'deleted',
  request_create: 'submitted a new-project request', request_update: 'submitted an edit request',
  request_delete: 'submitted a delete request', approve_create: 'approved a new project',
  approve_update: 'approved an edit', approve_delete: 'approved a deletion',
  deny_create: 'denied a new-project request', deny_update: 'denied an edit request',
  deny_delete: 'denied a delete request',
};
function fmtDate(d) {
  try { return new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

export default function AuditScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/audit', { params: { action: filter, limit: 150 } });
      setItems(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the audit log.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.flex}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f.key} style={[styles.chip, filter === f.key && styles.chipActive]} onPress={() => setFilter(f.key)}>
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <View style={styles.alert}><Text style={styles.alertText}>{error}</Text></View> : null}
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} size="large" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.log_id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>No activity recorded for this filter.</Text></View>}
          renderItem={({ item: a }) => (
            <View style={styles.row}>
              <View style={styles.rowTop}>
                <Text style={styles.who}>{a.user_name || 'system'}{a.user_role ? <Text style={styles.role}> · {a.user_role}</Text> : null}</Text>
                <Text style={styles.time}>{fmtDate(a.created_at)}</Text>
              </View>
              <Text style={styles.action}>
                {ACTION_TEXT[a.action] || a.action.replace(/_/g, ' ')}
                <Text style={styles.project}>{`  ·  ${a.project_title || a.details || '—'}`}</Text>
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
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

  row: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceEdge, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.sm },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  who: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.ink },
  role: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.inkFaint },
  time: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.inkFaint },
  action: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.inkSoft },
  project: { fontFamily: fonts.bodySemiBold, color: colors.ink },
});
