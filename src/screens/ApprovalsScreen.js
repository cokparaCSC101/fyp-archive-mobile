// Approvals screen — the request queue for the Head of Department (and admin).
// Review lecturer submissions and approve or deny them (with a reason).
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import api from '../api/client';
import Button from '../components/Button';
import Pill from '../components/Pill';
import { colors, fonts, spacing, radius, shadow } from '../theme';

const FILTERS = ['pending', 'approved', 'denied', 'all'];
const ACTION_VERB = { create: 'New project', update: 'Edit to', delete: 'Remove' };

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

function SimNote({ score, info }) {
  let matches = [];
  try { matches = JSON.parse(info || '[]'); } catch (e) { matches = []; }
  const tone = score >= 60 ? 'high' : score >= 30 ? 'med' : 'low';
  const label = score >= 60 ? 'High similarity' : score >= 30 ? 'Possible overlap'
              : (matches.length ? 'Low similarity' : 'No close matches found');
  const box = tone === 'high' ? styles.simHigh : tone === 'med' ? styles.simMed : styles.simLow;
  const txt = tone === 'high' ? styles.simHighText : tone === 'med' ? styles.simMedText : styles.simLowText;
  return (
    <View style={[styles.sim, box]}>
      <Text style={[styles.simLabel, txt]}>{label}{matches.length ? ` — ${score}% match` : ''}</Text>
      {matches.map((m) => (
        <Text key={m.project_id} style={[styles.simItem, txt]} numberOfLines={1}>{m.score}% · {m.title}</Text>
      ))}
    </View>
  );
}

export default function ApprovalsScreen() {
  const [filter, setFilter] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [denying, setDenying] = useState(null);
  const [denyNote, setDenyNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/requests', { params: { status: filter } });
      setRequests(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/requests/${id}/approve`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve the request.');
    } finally {
      setBusyId(null);
    }
  };

  const submitDeny = async () => {
    if (!denying) return;
    setBusyId(denying.request_id);
    try {
      await api.post(`/requests/${denying.request_id}/deny`, { review_note: denyNote });
      setDenying(null);
      setDenyNote('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not deny the request.');
    } finally {
      setBusyId(null);
    }
  };

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
        By {r.requested_by_name} · {fmtDate(r.created_at)}
        {r.reviewed_by_name ? ` · reviewed by ${r.reviewed_by_name}` : ''}
      </Text>

      {r.action !== 'delete' ? (
        <View style={styles.fields}>
          <Text style={styles.fieldLine}>
            <Text style={styles.lbl}>Student: </Text>{r.student_name}   <Text style={styles.lbl}>Year: </Text>{r.year_completed}
          </Text>
          <Text style={styles.fieldLine}><Text style={styles.lbl}>Supervisor: </Text>{r.supervisor_name || '—'}</Text>
          {r.abstract ? (
            <Text style={styles.abstract} numberOfLines={4}>{r.abstract}</Text>
          ) : null}
          {(r.project_link || r.project_webapp_link) ? (
            <View style={styles.linkRow}>
              {r.project_link ? (
                <Text style={styles.link} onPress={() => Linking.openURL(r.project_link)}>Document link</Text>
              ) : null}
              {r.project_webapp_link ? (
                <Text style={styles.link} onPress={() => Linking.openURL(r.project_webapp_link)}>Web app link</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : (
        <Text style={styles.fields}>Requests removal of this project from the archive.</Text>
      )}

      {r.action !== 'delete' && r.similarity_score != null ? (
        <SimNote score={Number(r.similarity_score)} info={r.similarity_info} />
      ) : null}

      {r.status === 'denied' && r.review_note ? (
        <View style={styles.note}><Text style={styles.noteText}><Text style={{ fontFamily: fonts.bodySemiBold }}>Reason: </Text>{r.review_note}</Text></View>
      ) : null}

      {r.status === 'pending' ? (
        <View style={styles.actions}>
          <Button title="Approve" variant="gold" small onPress={() => approve(r.request_id)} loading={busyId === r.request_id} style={{ flex: 1 }} />
          <Button title="Deny" variant="danger" small onPress={() => { setDenying(r); setDenyNote(''); }} style={{ flex: 1 }} />
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.flex}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f} style={[styles.chip, filter === f && styles.chipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <View style={styles.alert}><Text style={styles.alertText}>{error}</Text></View>
      ) : null}

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} size="large" /></View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => String(item.request_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No {filter === 'all' ? '' : filter} requests right now.</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!denying} animationType="slide" transparent onRequestClose={() => setDenying(null)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Deny request</Text>
            <Text style={styles.modalSub}>
              Add a short reason (the lecturer will see it).
            </Text>
            <TextInput
              style={styles.reasonInput}
              value={denyNote}
              onChangeText={setDenyNote}
              placeholder="e.g. Too similar to an existing project."
              placeholderTextColor={colors.inkFaint}
              multiline
            />
            <View style={styles.actions}>
              <Button title="Cancel" variant="ghost" onPress={() => setDenying(null)} style={{ flex: 1 }} />
              <Button title="Deny request" variant="danger" onPress={submitDeny} loading={busyId === denying?.request_id} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.surfaceEdge, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 7, backgroundColor: colors.surface, alignSelf: 'flex-start' },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.inkSoft },
  chipTextActive: { color: colors.white },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  emptyText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkFaint, textAlign: 'center' },
  listContent: { padding: spacing.xl, paddingTop: spacing.sm, flexGrow: 1 },

  alert: { backgroundColor: colors.dangerWash, marginHorizontal: spacing.xl, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.sm },
  alertText: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 14 },

  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.surfaceEdge,
    borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, ...shadow.card,
  },
  cardHead: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  title: { fontFamily: fonts.displaySemiBold, fontSize: 16, color: colors.ink, marginBottom: 4 },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: colors.inkFaint, marginBottom: spacing.md },
  fields: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.inkSoft },
  fieldLine: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.inkSoft, marginBottom: 3 },
  lbl: { color: colors.inkFaint },
  abstract: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.inkSoft, marginTop: 4, lineHeight: 19 },
  linkRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  link: { fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.goldDeep },

  sim: { marginTop: spacing.md, borderRadius: radius.sm, padding: spacing.md },
  simHigh: { backgroundColor: colors.dangerWash },
  simMed: { backgroundColor: colors.goldWash },
  simLow: { backgroundColor: '#edf1ea' },
  simLabel: { fontFamily: fonts.bodySemiBold, fontSize: 13, marginBottom: 2 },
  simItem: { fontFamily: fonts.bodyRegular, fontSize: 12.5, marginTop: 1 },
  simHighText: { color: colors.danger },
  simMedText: { color: colors.goldDeep },
  simLowText: { color: colors.inkSoft },

  note: { marginTop: spacing.md, backgroundColor: colors.dangerWash, borderRadius: radius.sm, padding: spacing.md },
  noteText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.danger },

  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,20,16,0.45)' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.xl },
  modalTitle: { fontFamily: fonts.displaySemiBold, fontSize: 20, color: colors.ink, marginBottom: 4 },
  modalSub: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.inkFaint, marginBottom: spacing.lg },
  reasonInput: {
    backgroundColor: colors.parchment, borderWidth: 1, borderColor: colors.surfaceEdge,
    borderRadius: radius.sm, padding: spacing.lg, minHeight: 90, textAlignVertical: 'top',
    fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.ink, marginBottom: spacing.lg,
  },
});
