import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from './theme';

export const JsonViewer = ({ data }: any) => {
  if (!data) return null;

  let formatted = data;

  try {
    formatted = JSON.stringify(JSON.parse(data), null, 2);
  } catch {}

  return (
    <ScrollView style={styles.container}>
      <View style={styles.codeBlock}>
        <Text selectable style={styles.code}>
          {formatted}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  codeBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  code: {
    color: colors.text,
    ...typography.body,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});
