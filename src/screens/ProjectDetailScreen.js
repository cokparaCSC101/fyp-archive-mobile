// Project detail screen — full record for a single project.
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import api from '../api/client';
import Button from '../components/Button';
import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { colors, fonts, spacing, radius, shadow } from '../theme';

export default function ProjectDetailScreen({ route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { id } = route.params;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        if (active) setProject(data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || 'Could not load this project.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const openLink = async () => {
    try {
      const supported = await Linking.canOpenURL(project.project_link);
      if (supported) await Linking.openURL(project.project_link);
      else Alert.alert('Cannot open link', 'This link could not be opened.');
    } catch {
      Alert.alert('Cannot open link', 'This link could not be opened.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Project not found</Text>
        <Text style={styles.errorText}>{error || 'This project may have been removed.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.yearChip}>
          <Text style={styles.yearText}>{project.year_completed}</Text>
        </View>

        <Text style={styles.title}>{project.title}</Text>

        <View style={styles.metaGrid}>
          <MetaItem label="STUDENT" value={project.student_name} />
          <MetaItem label="SUPERVISOR" value={project.supervisor_name} />
          <MetaItem label="DEPARTMENT" value={project.supervisor_department} />
          <MetaItem label="YEAR COMPLETED" value={String(project.year_completed)} />
        </View>

        <Text style={styles.sectionLabel}>ABSTRACT</Text>
        <Text style={styles.abstract}>{project.abstract}</Text>

        {project.project_link ? (
          <Button title="View full document  ↗" variant="gold" onPress={openLink} />
        ) : (
          <Text style={styles.noLink}>No external document linked for this project.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function MetaItem({ label, value }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.parchment },
  content: { padding: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.parchment, padding: spacing.xxl, gap: spacing.sm },
  errorTitle: { fontFamily: fonts.displaySemiBold, fontSize: 20, color: colors.ink },
  errorText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.inkFaint, textAlign: 'center' },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceEdge,
    borderRadius: radius.md,
    padding: spacing.xl,
    ...shadow.card,
  },
  yearChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldWash,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  yearText: { fontFamily: fonts.displaySemiBold, color: colors.goldDeep, fontSize: 14 },
  title: { fontFamily: fonts.displaySemiBold, fontSize: 24, lineHeight: 30, color: colors.ink, marginBottom: spacing.xl },

  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surfaceEdge,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
  },
  metaItem: { width: '50%', marginBottom: spacing.md, paddingRight: spacing.sm },
  metaLabel: { fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 1, color: colors.inkFaint, marginBottom: 3 },
  metaValue: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },

  sectionLabel: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.goldDeep, marginBottom: spacing.sm },
  abstract: { fontFamily: fonts.bodyRegular, fontSize: 15.5, lineHeight: 25, color: colors.inkSoft, marginBottom: spacing.xl },
  noLink: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.inkFaint, fontStyle: 'italic' },
});
