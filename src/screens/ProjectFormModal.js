// Add / edit project form, shown in a modal on the manage screen.
// When pendingMode is true (lecturers), labels reflect that the change is
// submitted to the HoD for approval rather than applied directly.
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import api from '../api/client';
import Button from '../components/Button';
import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { colors, fonts, spacing, radius } from '../theme';

const emptyForm = {
  title: '',
  student_name: '',
  year_completed: String(new Date().getFullYear()),
  abstract: '',
  project_link: '',
  project_webapp_link: '',
  supervisor_id: '',
};

export default function ProjectFormModal({ visible, initial, supervisors, onClose, onSaved, pendingMode = false }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        student_name: initial.student_name || '',
        year_completed: String(initial.year_completed || new Date().getFullYear()),
        abstract: initial.abstract || '',
        project_link: initial.project_link || '',
        project_webapp_link: initial.project_webapp_link || '',
        supervisor_id: initial.supervisor_id ? String(initial.supervisor_id) : '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [initial, visible]);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const selectedSupervisor = supervisors.find(
    (s) => String(s.supervisor_id) === String(form.supervisor_id)
  );

  const handleSubmit = async () => {
    setError('');
    if (!form.title || !form.student_name || !form.abstract || !form.supervisor_id) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, year_completed: parseInt(form.year_completed, 10) };
      const res = initial
        ? await api.put(`/projects/${initial.project_id}`, payload)
        : await api.post('/projects', payload);
      onSaved(res.data?.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const submitLabel = pendingMode ? 'Submit' : initial ? 'Save' : 'Add';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <View style={styles.head}>
            <Text style={styles.headTitle}>{initial ? 'Edit Project' : 'Add Project'}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {pendingMode ? (
              <View style={styles.hint}>
                <Text style={styles.hintText}>
                  This submission will be sent to the Head of Department for approval before it appears in the archive.
                </Text>
              </View>
            ) : null}
            <Field label="Project Title *">
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(v) => setField('title', v)}
                placeholder="Project title"
                placeholderTextColor={colors.inkFaint}
                multiline
              />
            </Field>

            <Field label="Student Name *">
              <TextInput
                style={styles.input}
                value={form.student_name}
                onChangeText={(v) => setField('student_name', v)}
                placeholder="Full name"
                placeholderTextColor={colors.inkFaint}
              />
            </Field>

            <Field label="Year Completed *">
              <TextInput
                style={styles.input}
                value={form.year_completed}
                onChangeText={(v) => setField('year_completed', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={4}
              />
            </Field>

            <Field label="Supervisor *">
              <Pressable style={styles.input} onPress={() => setPickerOpen(true)}>
                <Text style={selectedSupervisor ? styles.pickerValue : styles.pickerPlaceholder}>
                  {selectedSupervisor ? selectedSupervisor.full_name : 'Select a supervisor…'}
                </Text>
              </Pressable>
            </Field>

            <Field label="Abstract *">
              <TextInput
                style={[styles.input, styles.textarea]}
                value={form.abstract}
                onChangeText={(v) => setField('abstract', v)}
                placeholder="A concise summary of the project…"
                placeholderTextColor={colors.inkFaint}
                multiline
              />
            </Field>

            <Field label="Document Link (optional)">
              <TextInput
                style={styles.input}
                value={form.project_link}
                onChangeText={(v) => setField('project_link', v)}
                placeholder="https://… link to the full document"
                placeholderTextColor={colors.inkFaint}
                autoCapitalize="none"
                keyboardType="url"
              />
            </Field>

            <Field label="Project Web App Link (optional)">
              <TextInput
                style={styles.input}
                value={form.project_webapp_link}
                onChangeText={(v) => setField('project_webapp_link', v)}
                placeholder="https://… live demo / deployed project"
                placeholderTextColor={colors.inkFaint}
                autoCapitalize="none"
                keyboardType="url"
              />
            </Field>

            <View style={styles.actions}>
              <Button title="Cancel" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
              <Button title={submitLabel} variant="gold" onPress={handleSubmit} loading={saving} style={{ flex: 1 }} />
            </View>
            {error ? (
              <View style={[styles.alert, { marginTop: spacing.md, marginBottom: 0 }]}>
                <Text style={styles.alertText}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={pickerOpen} animationType="fade" transparent onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.pickerOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Select supervisor</Text>
            <ScrollView>
              {supervisors.map((s) => (
                <Pressable
                  key={s.supervisor_id}
                  style={styles.pickerRow}
                  onPress={() => {
                    setField('supervisor_id', String(s.supervisor_id));
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.pickerRowText}>{s.full_name}</Text>
                  <Text style={styles.pickerRowSub}>{s.department}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

function Field({ label, children }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,20,16,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%' },
  head: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.surfaceEdge,
  },
  headTitle: { fontFamily: fonts.displaySemiBold, fontSize: 20, color: colors.ink },
  close: { fontSize: 30, color: colors.inkFaint, lineHeight: 30 },
  body: { padding: spacing.xl },

  hint: { backgroundColor: colors.goldWash, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.lg },
  hintText: { fontFamily: fonts.bodyMedium, color: colors.goldDeep, fontSize: 13 },

  alert: { backgroundColor: colors.dangerWash, borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.lg },
  alertText: { fontFamily: fonts.bodyMedium, color: colors.danger, fontSize: 14 },

  field: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.inkSoft, marginBottom: 7 },
  input: {
    backgroundColor: colors.parchment, borderWidth: 1, borderColor: colors.surfaceEdge,
    borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: 12,
    fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.ink,
  },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  pickerValue: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.ink },
  pickerPlaceholder: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.inkFaint },

  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, marginBottom: spacing.xl },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(26,20,16,0.45)', justifyContent: 'center', padding: spacing.xl },
  pickerSheet: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, maxHeight: '70%' },
  pickerTitle: { fontFamily: fonts.displaySemiBold, fontSize: 18, color: colors.ink, marginBottom: spacing.md },
  pickerRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surfaceEdge },
  pickerRowText: { fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink },
  pickerRowSub: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.inkFaint, marginTop: 2 },
});
