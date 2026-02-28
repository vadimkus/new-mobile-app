import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Ellipse, Path, Circle as SvgCircle } from 'react-native-svg';
import Animated, { FadeIn, withDelay } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface Concern {
  zone: string;
  label: string;
  severity: string;
  color: string;
  x: number;
  y: number;
}

interface FaceMapProps {
  concerns: Concern[];
  size?: number;
}

export default function FaceMap({ concerns, size = 260 }: FaceMapProps) {
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size + 80 }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Face outline */}
        <Ellipse
          cx={cx}
          cy={cy * 0.95}
          rx={size * 0.33}
          ry={size * 0.42}
          stroke={colors.gold[500]}
          strokeWidth={1.2}
          strokeOpacity={0.3}
          fill="none"
        />

        {/* Eye lines */}
        <Ellipse cx={cx - size * 0.12} cy={cy * 0.78} rx={size * 0.07} ry={size * 0.03} stroke={colors.gold[500]} strokeWidth={0.8} strokeOpacity={0.2} fill="none" />
        <Ellipse cx={cx + size * 0.12} cy={cy * 0.78} rx={size * 0.07} ry={size * 0.03} stroke={colors.gold[500]} strokeWidth={0.8} strokeOpacity={0.2} fill="none" />

        {/* Nose line */}
        <Path
          d={`M ${cx} ${cy * 0.85} Q ${cx - size * 0.04} ${cy * 1.05} ${cx} ${cy * 1.08} Q ${cx + size * 0.04} ${cy * 1.05} ${cx} ${cy * 0.85}`}
          stroke={colors.gold[500]}
          strokeWidth={0.8}
          strokeOpacity={0.2}
          fill="none"
        />

        {/* Mouth line */}
        <Path
          d={`M ${cx - size * 0.08} ${cy * 1.2} Q ${cx} ${cy * 1.25} ${cx + size * 0.08} ${cy * 1.2}`}
          stroke={colors.gold[500]}
          strokeWidth={0.8}
          strokeOpacity={0.2}
          fill="none"
        />

        {/* Concern dots */}
        {concerns.map((c) => (
          <React.Fragment key={c.zone}>
            <SvgCircle
              cx={c.x * size}
              cy={c.y * size}
              r={8}
              fill={c.color}
              opacity={0.3}
            />
            <SvgCircle
              cx={c.x * size}
              cy={c.y * size}
              r={4}
              fill={c.color}
              opacity={0.9}
            />
          </React.Fragment>
        ))}
      </Svg>

      {/* Concern labels */}
      {concerns.map((c, i) => {
        const isLeft = c.x < 0.5;
        const labelX = isLeft ? -10 : size - 90;
        const labelY = c.y * size - 8;

        return (
          <Animated.View
            key={c.zone}
            entering={FadeIn.duration(400).delay(400 + i * 100)}
            style={[
              styles.label,
              {
                left: labelX,
                top: labelY,
              },
            ]}
          >
            <Text style={[styles.labelText, { color: c.color }]}>{c.label}</Text>
            <Text style={styles.severityText}>· {c.severity}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  label: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelText: {
    ...typography.caption2,
    fontWeight: '600',
    fontSize: 11,
  },
  severityText: {
    ...typography.caption2,
    color: colors.text.tertiary,
    fontSize: 10,
  },
});
