// Small status / action pill used across the approval, request, complaint
// and audit screens.
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';

const TONES = {
  pending:     { bg: colors.goldWash,   fg: colors.goldDeep },
  update:      { bg: colors.goldWash,   fg: colors.goldDeep },
  approved:    { bg: colors.tealWash,   fg: colors.teal },
  create:      { bg: colors.tealWash,   fg: colors.teal },
  denied:      { bg: colors.dangerWash, fg: colors.danger },
  delete:      { bg: colors.dangerWash, fg: colors.danger },
  // complaint statuses
  open:        { bg: colors.dangerWash, fg: colors.danger },
  seen:        { bg: colors.goldWash,   fg: colors.goldDeep },
  in_progress: { bg: '#e6ecf1',         fg: '#3a5566' },
  resolved:    { bg: colors.tealWash,   fg: colors.teal },
};

export default function Pill({ label, tone = 'pending' }) {
  const c = TONES[tone] || TONES.pending;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.fg }]}>{String(label).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.5 },
});
