import { useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useInspectorStore } from '../core/store';
import { colors, radius, shadow, typography } from './theme';

const { width, height } = Dimensions.get('window');
const START_POS = { x: width - 80, y: height - 150 };

export const FloatingButton = () => {
  const toggle = useInspectorStore((s) => s.toggle);

  const pan = useRef(new Animated.ValueXY(START_POS)).current;

  const start = useRef(START_POS).current;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,

        onPanResponderGrant: () => {
          // @ts-expect-error RN Animated internal
          start.x = pan.x._value;
          // @ts-expect-error RN Animated internal
          start.y = pan.y._value;
        },

        onPanResponderMove: (_, gesture) => {
          pan.setValue({
            x: start.x + gesture.dx,
            y: start.y + gesture.dy,
          });
        },

        onPanResponderRelease: () => {},
      }),
    [pan, start]
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.button, pan.getLayout()]}
    >
      <Pressable onPress={toggle} style={styles.pressable} hitSlop={12}>
        <Animated.Text style={styles.text}>API</Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accent,
    ...shadow.floating,
  },
  pressable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  text: {
    color: '#001316',
    ...typography.title,
  },
});
