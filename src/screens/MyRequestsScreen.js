// My Requests screen — lets a lecturer (or any staff member) track the
// status of changes they've submitted: pending, approved, or denied.
import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../api/client';
import Pill from '../components/Pill';
import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { colors, fonts, spacing, radius, shadow } from '../theme';

const ACTION_VERB = { create: 'New project', update: 'Edit to', delete: 'Remove' };

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

export default function MyRequestsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/requests/mine');
      setRequests(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const renderItem = ({ item: r }) => (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Pill label={r.action} tone={r.action} />
        <Pill label={r.status} tone={r.status} />
      </View>
      <Text style={styles.title}>
        {ACTION_VERB[r.action]}: {r.title || r.target_title || `Project #${r.target_project_id}`}
      </Text>
      <Text style={styles.meta}>
        Submitted {fmtDate(r.created_at)}
        {r.reviewed_at ? ` · reviewed ${fmtDate(r.reviewed_at)}` : ''}
      </Text>
      {r.status === 'pending' ? (
        <Text style={styles.pendingText}>Waiting for the Head of Department to review.</Text>
      ) : null}
      {r.status === 'denied' && r.review_note ? (
        <View style={styles.note}>
          <Text style={styles.noteText}>
            <Text style={{ fontFamily: fonts.bodySemiBold }}>Reason for denial: </Text>{r.review_note}
          </Text>
        </View>
      ) : null}
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.gold} size="large" /></View>;
  }

  return (
    <View style={styles.flex}>
      {error ? (
        <View style={styles.alert}><Text style={styles.alertText}>{error}</Text></View>
      ) : null}
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.request_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No requests yet. When you add, edit, or remove a project it will appear here with its status.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, backgroundColor: colors.parchment },
  listContent: { padding: spacing.xl, flexGrow: 1 },
  emptyText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkFaint, textAlign: 'center' },

  alert: { backgroundColor: colors.dangerWash, margin: spacing.xl, borderRadius: radius.sm, padding: spacing.md },
  alertText: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 14 },

  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceEdge,
    borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, ...shadow.card,
  },
  cardHead: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  title: { fontFamily: fonts.displaySemiBold, fontSize: 16, color: colors.ink, marginBottom: 4 },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: colors.inkFaint },
  pendingText: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.inkSoft, marginTop: spacing.sm },
  note: { marginTop: spacing.md, backgroundColor: colors.dangerWash, borderRadius: radius.sm, padding: spacing.md },
  noteText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.danger },
});
