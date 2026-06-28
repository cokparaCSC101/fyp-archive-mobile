// Project card shown in the browse list. Tapping it opens the detail screen.
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { radius, fonts, spacing, shadow } from '../theme';
import { useTheme } from '../context/ThemeContext';

export default function ProjectCard({ project, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.top}>
        <View style={styles.yearChip}>
          <Text style={styles.yearText}>{project.year_completed}</Text>
        </View>
      </View>
      <Text style={styles.title} numberOfLines={3}>{project.title}</Text>
      <Text style={styles.abstract} numberOfLines={3}>{project.abstract}</Text>
      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Student</Text>
          <Text style={styles.metaValue} numberOfLines={1}>{project.student_name}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Supervisor</Text>
          <Text style={styles.metaValue} numberOfLines={1}>{project.supervisor_name}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.surfaceEdge, borderWidth: 1, borderRadius: radius.md, padding: spacing.xl, marginBottom: spacing.lg, ...shadow.card },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  top: { flexDirection: 'row', marginBottom: spacing.md },
  yearChip: { backgroundColor: colors.goldWash, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 3 },
  yearText: { fontFamily: fonts.displaySemiBold, color: colors.goldDeep, fontSize: 13 },
  title: { fontFamily: fonts.displaySemiBold, fontSize: 18, lineHeight: 24, color: colors.ink, marginBottom: spacing.sm },
  abstract: { fontFamily: fonts.bodyRegular, fontSize: 14, lineHeight: 21, color: colors.inkSoft, marginBottom: spacing.lg },
  meta: { borderTopWidth: 1, borderTopColor: colors.surfaceEdge, paddingTop: spacing.md, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaLabel: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.inkFaint, width: 84 },
  metaValue: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink, flex: 1 },
});
