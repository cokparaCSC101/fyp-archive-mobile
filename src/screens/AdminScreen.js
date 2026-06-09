// Admin screen — manage the archive: add, edit, delete projects.
// Only reachable by admins (the backend also enforces this on writes).
import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../api/client';
import ProjectFormModal from './ProjectFormModal';
import Button from '../components/Button';
import { colors, fonts, spacing, radius, shadow } from '../theme';

export default function AdminScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, supRes] = await Promise.all([
        api.get('/projects', { params: { limit: 50, page: 1 } }),
        api.get('/supervisors'),
      ]);
      setProjects(projRes.data.data);
      setSupervisors(supRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={openAdd} hitSlop={10}>
          <Text style={styles.addBtn}>+ Add</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (project) => {
    setEditing(project);
    setModalOpen(true);
  };

  const handleSaved = async () => {
    setModalOpen(false);
    setEditing(null);
    await loadData();
  };

  const confirmDelete = (project) => {
    Alert.alert(
      'Delete project?',
      `This will permanently remove "${project.title}". This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/projects/${project.project_id}`);
              await loadData();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Could not delete the project.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {error ? (
        <View style={styles.alert}>
          <Text style={styles.alertText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.project_id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No projects yet. Tap “+ Add” to create the first one.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.rowMeta}>
                {item.student_name} · {item.year_completed} · {item.supervisor_name}
              </Text>
            </View>
            <View style={styles.rowActions}>
              <Button title="Edit" variant="ghost" small onPress={() => openEdit(item)} />
              <Button title="Delete" variant="danger" small onPress={() => confirmDelete(item)} />
            </View>
          </View>
        )}
      />

      <ProjectFormModal
        visible={modalOpen}
        initial={editing}
        supervisors={supervisors}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  listContent: { padding: spacing.xl, flexGrow: 1 },
  addBtn: { fontFamily: fonts.bodySemiBold, color: colors.goldDeep, fontSize: 15 },

  alert: { backgroundColor: colors.dangerWash, margin: spacing.xl, borderRadius: radius.sm, padding: spacing.md },
  alertText: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 14 },

  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceEdge,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  rowInfo: { marginBottom: spacing.md },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink, marginBottom: 4 },
  rowMeta: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.inkFaint },
  rowActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
  emptyText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkFaint, textAlign: 'center' },
});
