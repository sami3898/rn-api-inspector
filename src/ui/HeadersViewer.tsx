import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from './theme';

type Props = {
  headers?: Record<string, string> | null;
};

export const HeadersViewer = ({ headers }: Props) => {
  if (!headers || Object.keys(headers).length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No headers</Text>
      </View>
    );
  }

  const entries = Object.entries(headers);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.table}>
        {entries.map(([key, value], index) => (
          <View
            key={key}
            style={[styles.row, index % 2 === 0 && styles.rowAlt]}
          >
            <Text style={styles.key} numberOfLines={1}>
              {key}
            </Text>
            <Text style={styles.value} selectable>
              {value}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {entries.length} header{entries.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowAlt: {
    backgroundColor: colors.panel,
  },
  key: {
    flex: 0.4,
    color: colors.accent,
    ...typography.caption,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginRight: spacing.sm,
  },
  value: {
    flex: 0.6,
    color: colors.text,
    ...typography.caption,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  countRow: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
    paddingRight: spacing.xs,
  },
  countText: {
    color: colors.muted,
    fontSize: 10,
  },
  empty: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.panel,
  },
  emptyText: {
    color: colors.muted,
    ...typography.caption,
  },
});
