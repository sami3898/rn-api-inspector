import { useMemo, useRef, useState, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  PanResponder,
  TextInput,
  Pressable,
} from 'react-native';

import { useInspectorStore } from '../core/store';
import { RequestItem } from './RequestItem';
import { RequestDetail } from './RequestDetails';
import { Toast } from './Toast';
import { colors, radius, shadow, spacing, typography } from './theme';

const { height } = Dimensions.get('window');

export const InspectorPanel = () => {
  const { isVisible, logs, selectedLog, toggle, clear, toast } =
    useInspectorStore();
  const [query, setQuery] = useState('');
  const [errorsOnly, setErrorsOnly] = useState(false);

  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isVisible ? 0 : height,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [isVisible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10,

      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          translateY.setValue(g.dy);
        }
      },

      onPanResponderRelease: (_, g) => {
        if (g.dy > 150) {
          toggle();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return logs.filter((l) => {
      if (errorsOnly && !l.error && (!l.status || l.status < 400)) return false;
      if (!q) return true;

      const haystack = `${l.method} ${l.url} ${l.status ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [errorsOnly, logs, query]);

  if (!isVisible) return null;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={toggle} />

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.sheet, { transform: [{ translateY }] }]}
      >
        <View style={styles.header}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>API Inspector</Text>
            <Pressable onPress={toggle} hitSlop={10} style={styles.closeBtn}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          {!selectedLog ? (
            <View style={styles.controls}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search URL / method / status"
                placeholderTextColor={colors.muted}
                autoCorrect={false}
                autoCapitalize="none"
                style={styles.search}
              />

              <View style={styles.controlRow}>
                <Pressable
                  onPress={() => setErrorsOnly((v) => !v)}
                  style={[styles.chip, errorsOnly && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      errorsOnly && styles.chipTextActive,
                    ]}
                  >
                    Errors only
                  </Text>
                </Pressable>

                <Pressable onPress={clear} style={styles.chip}>
                  <Text style={styles.chipText}>Clear</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>

        {!selectedLog ? (
          filteredLogs.length ? (
            <FlatList
              data={filteredLogs}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => <RequestItem item={item} />}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No requests yet</Text>
              <Text style={styles.emptyText}>
                Trigger a fetch/axios call, then select it to view details.
              </Text>
            </View>
          )
        ) : (
          <RequestDetail />
        )}
      </Animated.View>
      <Toast message={toast} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  sheet: {
    width: '100%',
    height: '85%',
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...shadow.floating,
  },
  header: {
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    ...typography.title,
  },
  closeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
  },
  close: {
    color: colors.muted,
    fontSize: 12,
  },
  controls: {
    width: '100%',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 12,
  },
  controlRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: colors.error,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
  },
  chipTextActive: {
    color: colors.error,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    ...typography.title,
  },
  emptyText: {
    color: colors.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
    ...typography.body,
  },
});
