import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useImageColors, DEFAULT_COLORS, type ProductColors } from '../../hooks/useImageColors';

interface AdaptiveProductImageProps {
  source: ImageSource;
  imageUri?: string;
  width: number;
  height: number;
  style?: ViewStyle;
  showGlow?: boolean;
  edgeFade?: boolean;
  edgeFadeIntensity?: number;
  glowSize?: number;
  contentFit?: 'contain' | 'cover' | 'fill';
  onColorsExtracted?: (c: ProductColors) => void;
}

export default function AdaptiveProductImage({
  source,
  imageUri,
  width,
  height,
  style,
  showGlow = true,
  edgeFade = true,
  edgeFadeIntensity = 0.18,
  glowSize = 1.4,
  contentFit = 'contain',
  onColorsExtracted,
}: AdaptiveProductImageProps) {
  const pc = useImageColors(imageUri);

  React.useEffect(() => {
    if (pc.isExtracted && onColorsExtracted) {
      onColorsExtracted(pc);
    }
  }, [pc.isExtracted]);

  const bg = pc.isExtracted ? pc.dominant : DEFAULT_COLORS.dominant;
  const glow = pc.isExtracted ? pc.glowColor : DEFAULT_COLORS.glowColor;
  const glowW = width * glowSize;
  const glowH = height * glowSize;
  const fadeTop = edgeFadeIntensity;
  const fadeSide = edgeFadeIntensity * 0.85;

  return (
    <View style={[{ width, height, backgroundColor: bg }, style]}>
      {/* Ambient radial glow */}
      {showGlow && (
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[
            StyleSheet.absoluteFill,
            { alignItems: 'center', justifyContent: 'center', opacity: 0.07 },
          ]}
          pointerEvents="none"
        >
          <Svg width={glowW} height={glowH} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="adaptGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={glow} stopOpacity={0.3} />
                <Stop offset="40%" stopColor={glow} stopOpacity={0.12} />
                <Stop offset="75%" stopColor={glow} stopOpacity={0.03} />
                <Stop offset="100%" stopColor="#000" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={50} cy={50} rx={50} ry={50} fill="url(#adaptGlow)" />
          </Svg>
        </Animated.View>
      )}

      {/* Product image */}
      <Image
        source={source}
        style={{ width, height }}
        contentFit={contentFit}
        transition={300}
      />

      {/* Edge fade overlays */}
      {edgeFade && (
        <>
          <LinearGradient
            colors={[bg, 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: fadeTop }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', bg]}
            start={{ x: 0.5, y: 1 - fadeTop }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <LinearGradient
            colors={[bg, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: fadeSide, y: 0.5 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', bg]}
            start={{ x: 1 - fadeSide, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </>
      )}
    </View>
  );
}
