import { Pressable, StyleSheet, Text, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useInspectorStore } from '../core/store';
import { colors, radius, spacing, typography } from './theme';
import { toCurl } from '../utils/curl';
import { retryRequest } from '../utils/retry';

export const RequestItem = ({ item }: any) => {
  const select = useInspectorStore((s) => s.selectLog);
  const showToast = useInspectorStore((s) => s.showToast);

  const statusColor =
    item.status >= 200 && item.status < 300
      ? colors.success
      : item.status >= 400 || item.error
        ? colors.error
        : colors.muted;

  const durationColor =
    item.duration > 1500
      ? colors.error
      : item.duration > 800
        ? colors.accent
        : colors.muted;

  const urlText = item.url || '';
  const compactUrl = urlText.replace(/^https?:\/\//, '');

  return (
    <View style={styles.container}>
      <Pressable style={styles.content} onPress={() => select(item)}>
        <View style={styles.topRow}>
          <View style={[styles.badge, styles.methodBadge]}>
            <Text style={styles.methodText}>{item.method}</Text>
          </View>

          <Text numberOfLines={1} style={styles.url}>
            {compactUrl}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.badge, { borderColor: statusColor }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {item.status || 'ERR'}
            </Text>
          </View>

          <Text style={[styles.metaText, { color: durationColor }]}>
            {item.duration}ms
          </Text>

          {item.error ? <Text style={styles.errorText}>Error</Text> : null}
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          style={styles.actionBtn}
          hitSlop={10}
          onPress={() => {
            Clipboard.setString(toCurl(item));
            showToast('cURL copied');
          }}
        >
          <Text style={styles.actionText}>Copy</Text>
        </Pressable>

        <Pressable
          style={[styles.actionBtn, styles.retryBtn]}
          hitSlop={10}
          onPress={() => retryRequest(item)}
        >
          <Text style={[styles.actionText, styles.retryText]}>Retry</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  url: {
    flex: 1,
    color: colors.text,
    ...typography.body,
  },
  metaRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    ...typography.caption,
  },
  errorText: {
    color: colors.error,
    ...typography.caption,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  methodBadge: {
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(34,211,238,0.10)',
  },
  methodText: {
    color: colors.accent,
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionText: {
    color: colors.muted,
    ...typography.caption,
    fontWeight: '700',
  },
  retryBtn: {
    borderColor: 'rgba(74,222,128,0.35)',
    backgroundColor: 'rgba(74,222,128,0.10)',
  },
  retryText: {
    color: colors.success,
  },
});
