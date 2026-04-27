import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share } from 'react-native';
import { useInspectorStore } from '../core/store';
import { JsonViewer } from './JsonViewer';
import { HeadersViewer } from './HeadersViewer';
import Clipboard from '@react-native-clipboard/clipboard';
import { toCurl } from '../utils/curl';
import { exportLogsAsHarLite } from '../utils/har';
import { colors, radius, spacing, typography } from './theme';

type Tab = 'response' | 'request' | 'req_headers' | 'res_headers';

export const RequestDetail = () => {
  const { selectedLog, selectLog, showToast } = useInspectorStore();
  const [tab, setTab] = useState<Tab>('response');

  if (!selectedLog) return null;

  const formatBody = (body: any): string => {
    if (!body) return '';
    if (typeof body === 'string') {
      try {
        return JSON.stringify(JSON.parse(body), null, 2);
      } catch {
        return body;
      }
    }
    try {
      return JSON.stringify(body, null, 2);
    } catch {
      return String(body);
    }
  };

  const requestBody = formatBody(selectedLog.requestBody);

  const getTabData = (): string => {
    switch (tab) {
      case 'response':
        return selectedLog.response || selectedLog.error || '';
      case 'request':
        return requestBody;
      case 'req_headers':
        return JSON.stringify(selectedLog.requestHeaders || {}, null, 2);
      case 'res_headers':
        return JSON.stringify(selectedLog.responseHeaders || {}, null, 2);
      default:
        return '';
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'response', label: 'Response' },
    { key: 'request', label: 'Body' },
    { key: 'req_headers', label: 'Req Headers' },
    { key: 'res_headers', label: 'Res Headers' },
  ];

  const isHeaderTab = tab === 'req_headers' || tab === 'res_headers';
  const headersData =
    tab === 'req_headers'
      ? selectedLog.requestHeaders
      : tab === 'res_headers'
        ? selectedLog.responseHeaders
        : undefined;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={() => selectLog(null)} style={styles.backBtn}>
          <Text style={styles.back}>Back</Text>
        </Pressable>

        <View style={styles.badges}>
          <View style={[styles.badge, styles.methodBadge]}>
            <Text style={styles.method}>{selectedLog.method}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.status}>
              {selectedLog.status ?? (selectedLog.error ? 'ERR' : '—')}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.duration}>{selectedLog.duration}ms</Text>
          </View>
        </View>
      </View>

      {/* URL */}
      <Text style={styles.url} numberOfLines={2}>
        {selectedLog.url}
      </Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tab, tab === t.key && styles.activeTab]}
          >
            <Text
              style={[styles.tabText, tab === t.key && styles.activeTabText]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {isHeaderTab ? (
        <HeadersViewer headers={headersData} />
      ) : (
        <JsonViewer
          data={tab === 'response' ? selectedLog.response : requestBody}
        />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.action}
          onPress={() => {
            Clipboard.setString(getTabData());
            showToast('Copied to clipboard');
          }}
        >
          <Text style={styles.actionText}>Copy</Text>
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() => {
            Clipboard.setString(toCurl(selectedLog));
            showToast('cURL copied');
          }}
        >
          <Text style={styles.actionText}>cURL</Text>
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() => {
            Clipboard.setString(JSON.stringify(selectedLog, null, 2));
            showToast('JSON copied');
          }}
        >
          <Text style={styles.actionText}>JSON</Text>
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() =>
            Share.share({
              title: 'API Inspector',
              message: getTabData(),
            })
          }
        >
          <Text style={styles.actionText}>Share</Text>
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() => {
            Clipboard.setString(
              JSON.stringify(exportLogsAsHarLite([selectedLog]), null, 2)
            );
            showToast('HAR copied');
          }}
        >
          <Text style={styles.actionText}>HAR</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
  },
  back: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  methodBadge: {
    borderColor: 'rgba(34,211,238,0.35)',
    backgroundColor: 'rgba(34,211,238,0.10)',
  },
  method: {
    color: colors.accent,
    ...typography.caption,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  status: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '700',
  },
  duration: {
    color: colors.muted,
    ...typography.caption,
    fontWeight: '700',
  },
  url: {
    color: colors.text,
    marginTop: spacing.sm,
    ...typography.body,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: colors.panel,
    borderRadius: radius.sm,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.success,
    borderRadius: radius.sm,
  },
  tabText: {
    color: colors.muted,
    fontSize: 10,
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  action: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
  },
  actionText: {
    color: colors.text,
    ...typography.caption,
    fontWeight: '700',
  },
});
