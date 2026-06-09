// Reusable themed button. Variants: primary (ink), gold, ghost, danger.
import { Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, fonts, spacing } from '../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  small = false,
  style,
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.ink : colors.white} />
      ) : (
        <Text style={[styles.text, small && styles.textSmall, styles[`${variant}Text`]]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  small: { paddingVertical: 8, paddingHorizontal: spacing.lg, minHeight: 38 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },

  primary: { backgroundColor: colors.ink },
  gold: { backgroundColor: colors.gold },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.surfaceEdge },
  danger: { backgroundColor: colors.dangerWash },

  text: { fontFamily: fonts.bodySemiBold, fontSize: 15 },
  textSmall: { fontSize: 13.5 },
  primaryText: { color: colors.white },
  goldText: { color: colors.white },
  ghostText: { color: colors.ink },
  dangerText: { color: colors.danger },
});
