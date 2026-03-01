import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Modal,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Defs, RadialGradient, Stop, Line, Rect } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withDecay,
  useAnimatedSensor,
  SensorType,
  Easing,
  runOnJS,
  cancelAnimation,
  interpolateColor,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useImageColors } from '../../hooks/useImageColors';
import { LuxuryIcon, matchBenefitIcon, getCycleIcon, type LuxuryIconName } from '../../constants/luxuryIcons';

const { width: SW, height: SH } = Dimensions.get('window');

const PODIUM_W = SW - 40;
const PODIUM_H = SW * 0.95;
const CX = PODIUM_W / 2;
const CY = PODIUM_H * 0.38;
const IMG_W = SW * 0.44;
const IMG_H = SW * 0.54;

const PILL_R = 36;
const ORB_RX = CX - PILL_R + 10;
const ORB_RY = SW * 0.34;

const MAX_PILLS = 7;
const SPARKLE_N = 10;
const ROTATION_SENSITIVITY = 0.006;

const SPRING_ORBIT = { damping: 18, stiffness: 120, mass: 0.8 };
const SPRING_SELECT = { damping: 14, stiffness: 160, mass: 0.6 };

const GOLD = colors.gold[500];
const GOLD_DIM = 'rgba(201, 169, 110, 0.12)';
const GOLD_GLOW = 'rgba(201, 169, 110, 0.35)';
const BG = colors.bg.primary;

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface BenefitData {
  short: string;
  label: string;
  detail: string;
  iconName: LuxuryIconName;
}

function firstWord(str: string): string {
  const w = str.trim().split(/\s+/)[0] || str.trim();
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function parseBenefit(raw: any, i: number): BenefitData {
  if (typeof raw === 'string') {
    const dash = raw.indexOf(' - ');
    const label = dash > 0 ? raw.slice(0, dash).trim() : raw.trim();
    const detail = dash > 0 ? raw.slice(dash + 3).trim() : label;
    const iconName = matchBenefitIcon(raw) !== 'sparkle' ? matchBenefitIcon(raw) : getCycleIcon(i);
    return { short: firstWord(label), label, detail, iconName };
  }
  const fullLabel = raw?.label || `Benefit ${i + 1}`;
  return {
    short: firstWord(fullLabel),
    label: fullLabel.trim(),
    detail: raw?.description || '',
    iconName: matchBenefitIcon(fullLabel || raw?.description || '') !== 'sparkle'
      ? matchBenefitIcon(fullLabel || raw?.description || '')
      : getCycleIcon(i),
  };
}

// ─── Sparkle ──────────────────────────────────────────────────────────────────

function Sparkle({ x, y, size, d }: { x: number; y: number; size: number; d: number }) {
  const op = useSharedValue(0);
  const ty = useSharedValue(0);

  useEffect(() => {
    op.value = withDelay(d, withRepeat(withSequence(
      withTiming(0.5, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
    ), -1, true));
    ty.value = withDelay(d, withRepeat(withSequence(
      withTiming(-8, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
      withTiming(8, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
    ), -1, true));
  }, []);

  const s = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View
      style={[{
        position: 'absolute', left: x, top: y,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: colors.gold[400],
      }, s]}
      pointerEvents="none"
    />
  );
}

// ─── Orbiting Pill ────────────────────────────────────────────────────────────

function OrbitPill({
  benefit,
  index,
  total,
  orbitAngle,
  selectedIdx,
  jsSelected,
  onTap,
}: {
  benefit: BenefitData;
  index: number;
  total: number;
  orbitAngle: Animated.SharedValue<number>;
  selectedIdx: Animated.SharedValue<number>;
  jsSelected: boolean;
  onTap: (i: number) => void;
}) {
  const baseAngle = (Math.PI * 2 * index) / Math.max(total, 1);

  const pillStyle = useAnimatedStyle(() => {
    const angle = orbitAngle.value + baseAngle;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const x = CX + ORB_RX * sinA - PILL_R;
    const y = CY + ORB_RY * cosA - PILL_R;

    const depth = (cosA + 1) / 2;
    const depthScale = 0.75 + depth * 0.3;
    const depthOpacity = 0.45 + depth * 0.55;

    const isMe = selectedIdx.value === index;
    const anySelected = selectedIdx.value >= 0;
    const dimmed = anySelected && !isMe;

    return {
      position: 'absolute' as const,
      left: isMe ? withSpring(CX - PILL_R, SPRING_ORBIT) : x,
      top: isMe ? withSpring(CY + IMG_H / 2 + 20, SPRING_ORBIT) : y,
      opacity: withTiming(dimmed ? 0.15 : depthOpacity, { duration: 250 }),
      zIndex: isMe ? 50 : 10 + Math.round(depth * 20),
      transform: [
        { scale: withSpring(isMe ? 1.1 : depthScale, SPRING_SELECT) },
      ],
    };
  });

  // Graceful highlight: gold border glow that breathes when selected
  const borderGlow = useSharedValue(0);

  useEffect(() => {
    return () => cancelAnimation(borderGlow);
  }, []);

  const borderStyle = useAnimatedStyle(() => {
    const isMe = selectedIdx.value === index;

    if (isMe && borderGlow.value < 0.5) {
      borderGlow.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    } else if (!isMe && borderGlow.value > 0) {
      borderGlow.value = withTiming(0, { duration: 300 });
    }

    return {
      borderColor: interpolateColor(
        borderGlow.value,
        [0, 0.5, 1],
        ['rgba(255,255,255,0.08)', GOLD_DIM, GOLD],
      ),
      borderWidth: isMe ? 1.5 : 1,
    };
  });

  // Outer glow aura for selected pill
  const auraStyle = useAnimatedStyle(() => {
    const isMe = selectedIdx.value === index;
    return {
      opacity: withTiming(isMe ? 0.3 : 0, { duration: 400, easing: Easing.out(Easing.cubic) }),
      transform: [{ scale: withSpring(isMe ? 1.25 : 0.9, SPRING_SELECT) }],
    };
  });

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onTap)(index);
  });

  const marqueeX = useSharedValue(0);

  const containerW = 60;
  const charW = 6.5;
  const estTextW = benefit.label.length * charW + benefit.label.length * 0.8;
  const travel = Math.max(0, estTextW - containerW + 6);
  const needsScroll = travel > 0;

  useEffect(() => {
    if (jsSelected && needsScroll) {
      marqueeX.value = 0;
      marqueeX.value = withRepeat(
        withSequence(
          withDelay(600, withTiming(-travel, { duration: Math.max(travel * 50, 800), easing: Easing.linear })),
          withDelay(800, withTiming(0, { duration: Math.max(travel * 50, 800), easing: Easing.linear })),
        ),
        -1,
      );
    } else {
      cancelAnimation(marqueeX);
      marqueeX.value = withTiming(0, { duration: 200 });
    }
  }, [jsSelected]);

  const marqueeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: marqueeX.value }],
  }));

  return (
    <Animated.View style={pillStyle}>
      {/* Outer aura glow */}
      <Animated.View style={[styles.pillAura, auraStyle]} pointerEvents="none" />

      <GestureDetector gesture={tap}>
        <Animated.View style={[styles.pillCircle, borderStyle]}>
          <View style={styles.pillIconWrap}>
            <LuxuryIcon name={benefit.iconName} size={20} color="rgba(201, 169, 110, 0.7)" weight="duotone" />
          </View>
          <View style={styles.pillLabelWrap}>
            <Animated.View style={[styles.pillLabelSlider, marqueeStyle]}>
              <Text style={styles.pillLabel} numberOfLines={1}>
                {jsSelected ? benefit.label : benefit.short}
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

// ─── Connection Line (SVG) ────────────────────────────────────────────────────

function ConnectionLine({
  selectedIdx,
  total,
  orbitAngle,
}: {
  selectedIdx: number;
  total: number;
  orbitAngle: number;
}) {
  if (selectedIdx < 0) return null;

  const baseAngle = (Math.PI * 2 * selectedIdx) / Math.max(total, 1);
  const angle = orbitAngle + baseAngle;
  const px = CX + ORB_RX * Math.sin(angle);
  const py = CY + ORB_RY * Math.cos(angle);

  return (
    <Svg
      width={PODIUM_W}
      height={PODIUM_H}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id="lineGrad" cx="50%" cy="0%" rx="50%" ry="100%">
          <Stop offset="0%" stopColor={GOLD} stopOpacity={0.5} />
          <Stop offset="100%" stopColor={GOLD} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Line
        x1={CX}
        y1={CY}
        x2={px}
        y2={py}
        stroke={GOLD}
        strokeWidth={0.6}
        strokeDasharray="4,4"
        opacity={0.25}
      />
    </Svg>
  );
}

// ─── Detail Card ──────────────────────────────────────────────────────────────

function DetailCard({ benefit, visible }: { benefit: BenefitData | null; visible: boolean }) {
  const a = useAnimatedStyle(() => ({
    opacity: withTiming(visible && benefit ? 1 : 0, { duration: 280 }),
    transform: [{ translateY: withSpring(visible && benefit ? 0 : 14, SPRING_ORBIT) }],
  }));

  if (!benefit) return null;

  return (
    <Animated.View style={[styles.detailCard, a]} pointerEvents={visible ? 'auto' : 'none'}>
      <BlurView intensity={Platform.OS === 'ios' ? 30 : 45} tint="dark" style={styles.detailBlur}>
        <View style={styles.detailInner}>
          <View style={styles.detailIconWrap}>
            <LuxuryIcon name={benefit.iconName} size={28} color={GOLD} weight="duotone" />
          </View>
          <Text style={styles.detailTitle}>{benefit.short}</Text>
          {benefit.detail ? <Text style={styles.detailText}>{benefit.detail}</Text> : null}
        </View>
      </BlurView>
    </Animated.View>
  );
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function ImageLightbox({
  source,
  visible,
  onClose,
}: {
  source: ImageSource;
  visible: boolean;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <Animated.View
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(200)}
        style={styles.lightboxBg}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Close hint */}
        <Animated.View
          entering={FadeIn.delay(300).duration(400)}
          style={styles.lightboxClose}
        >
          <BlurView intensity={20} tint="dark" style={styles.lightboxCloseBlur}>
            <Text style={styles.lightboxCloseText}>Tap anywhere to close</Text>
          </BlurView>
        </Animated.View>

        {/* Expanded image */}
        <Animated.View
          entering={ZoomIn.springify().damping(16).stiffness(140)}
          exiting={ZoomOut.duration(200)}
          style={styles.lightboxImgWrap}
          pointerEvents="none"
        >
          <Image
            source={source}
            style={styles.lightboxImg}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>

        {/* Gold accent ring */}
        <Animated.View
          entering={FadeIn.delay(200).duration(500)}
          style={styles.lightboxRing}
          pointerEvents="none"
        />
      </Animated.View>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  imageSource: ImageSource;
  imageUri?: string;
  benefits: any[];
}

export default function InteractivePodium({ imageSource, imageUri, benefits }: Props) {
  const pc = useImageColors(imageUri);
  const dynBG = pc.isExtracted ? pc.dominant : BG;
  const dynGlow = pc.isExtracted ? pc.glowColor : GOLD;
  const pills = useMemo(
    () => benefits.slice(0, MAX_PILLS).map((b, i) => parseBenefit(b, i)),
    [benefits],
  );

  const orbitAngle = useSharedValue(0);
  const savedAngle = useSharedValue(0);
  const selectedIdx = useSharedValue(-1);

  const [detailBenefit, setDetailBenefit] = useState<BenefitData | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  // Track orbit angle in JS for the SVG connection line
  const [jsOrbitAngle, setJsOrbitAngle] = useState(0);
  const [jsSelectedIdx, setJsSelectedIdx] = useState(-1);

  // Auto-rotate slowly
  useEffect(() => {
    orbitAngle.value = withRepeat(
      withTiming(orbitAngle.value + Math.PI * 2, { duration: 45000, easing: Easing.linear }),
      -1,
    );
    return () => cancelAnimation(orbitAngle);
  }, []);

  // Pan gesture → rotate orbit
  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onStart(() => {
      cancelAnimation(orbitAngle);
      savedAngle.value = orbitAngle.value;
    })
    .onUpdate((e) => {
      orbitAngle.value = savedAngle.value + e.translationX * ROTATION_SENSITIVITY;
    })
    .onEnd((e) => {
      orbitAngle.value = withDecay({
        velocity: e.velocityX * ROTATION_SENSITIVITY,
        deceleration: 0.997,
      });
    });

  // Tap background → deselect
  const bgTap = Gesture.Tap().onEnd(() => {
    if (selectedIdx.value >= 0) {
      selectedIdx.value = -1;
      runOnJS(setShowDetail)(false);
      runOnJS(setDetailBenefit)(null);
      runOnJS(setJsSelectedIdx)(-1);
    }
  });

  const composed = Gesture.Race(pan, bgTap);

  const handlePillTap = useCallback((i: number) => {
    cancelAnimation(orbitAngle);

    if (selectedIdx.value === i) {
      selectedIdx.value = -1;
      setShowDetail(false);
      setDetailBenefit(null);
      setJsSelectedIdx(-1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      orbitAngle.value = withRepeat(
        withTiming(orbitAngle.value + Math.PI * 2, { duration: 45000, easing: Easing.linear }),
        -1,
      );
    } else {
      selectedIdx.value = i;
      setDetailBenefit(pills[i]);
      setShowDetail(true);
      setJsSelectedIdx(i);
      setJsOrbitAngle(orbitAngle.value);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [pills]);

  const handleImageTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLightboxVisible(true);
  }, []);

  // Gyroscope parallax
  const sensor = useAnimatedSensor(SensorType.ROTATION, { interval: 16 });
  const sX = useDerivedValue(() => {
    try { const v = sensor?.sensor?.value; return v ? Math.max(-1, Math.min(1, (v.pitch ?? 0) * 1.5)) : 0; }
    catch { return 0; }
  });
  const sY = useDerivedValue(() => {
    try { const v = sensor?.sensor?.value; return v ? Math.max(-1, Math.min(1, (v.roll ?? 0) * 1.5)) : 0; }
    catch { return 0; }
  });

  const imgParallax = useAnimatedStyle(() => ({
    transform: [{ translateX: sY.value * -6 }, { translateY: sX.value * -4 }],
  }));

  // Product float
  const floatVal = useSharedValue(0);
  useEffect(() => {
    floatVal.value = withRepeat(withSequence(
      withTiming(-7, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
    ), -1, true);
  }, []);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: floatVal.value }] }));

  // Glow pulse
  const glowVal = useSharedValue(0.05);
  useEffect(() => {
    glowVal.value = withRepeat(withSequence(
      withTiming(0.09, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      withTiming(0.03, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
    ), -1, true);
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowVal.value }));

  // Sparkles
  const sparkles = useMemo(() => {
    const a = [];
    for (let i = 0; i < SPARKLE_N; i++) {
      const ang = (Math.PI * 2 * i) / SPARKLE_N + (i % 3) * 0.3;
      const dist = 0.35 + (i % 4) * 0.15;
      a.push({ x: CX + ORB_RX * dist * Math.cos(ang), y: CY + ORB_RY * dist * Math.sin(ang), size: 1.5 + (i % 3) * 0.8, delay: i * 300 });
    }
    return a;
  }, []);

  // Image tap gesture
  const imgTap = Gesture.Tap().onEnd(() => {
    runOnJS(handleImageTap)();
  });

  return (
    <View style={styles.root}>
      <GestureDetector gesture={composed}>
        <Animated.View style={styles.podium}>
          {/* Sparkles */}
          {sparkles.map((sp, i) => (
            <Sparkle key={i} x={sp.x} y={sp.y} size={sp.size} d={sp.delay} />
          ))}

          {/* Ambient radial glow — color-adaptive SVG */}
          <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none">
            <Svg width={SW * 0.62} height={SW * 0.62} viewBox={`0 0 100 100`}>
              <Defs>
                <RadialGradient id="ambientGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor={dynGlow} stopOpacity={0.18} />
                  <Stop offset="35%" stopColor={dynGlow} stopOpacity={0.08} />
                  <Stop offset="70%" stopColor={dynGlow} stopOpacity={0.02} />
                  <Stop offset="100%" stopColor={dynBG} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Ellipse cx={50} cy={50} rx={50} ry={50} fill="url(#ambientGlow)" />
            </Svg>
          </Animated.View>

          {/* Connection line to selected pill */}
          <ConnectionLine
            selectedIdx={jsSelectedIdx}
            total={pills.length}
            orbitAngle={jsOrbitAngle}
          />

          {/* Product image — tap to expand */}
          <Animated.View style={[styles.imgWrap, imgParallax]}>
            <GestureDetector gesture={imgTap}>
              <Animated.View style={floatStyle}>
                <Image source={imageSource} style={styles.img} contentFit="contain" transition={300} />

                {/* Edge fade overlays — adaptive color blend */}
                <LinearGradient
                  colors={[dynBG, 'transparent']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 0.18 }}
                  style={styles.edgeFade}
                  pointerEvents="none"
                />
                <LinearGradient
                  colors={['transparent', dynBG]}
                  start={{ x: 0.5, y: 0.82 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.edgeFade}
                  pointerEvents="none"
                />
                <LinearGradient
                  colors={[dynBG, 'transparent']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 0.15, y: 0.5 }}
                  style={styles.edgeFade}
                  pointerEvents="none"
                />
                <LinearGradient
                  colors={['transparent', dynBG]}
                  start={{ x: 0.85, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.edgeFade}
                  pointerEvents="none"
                />

                {/* Tap hint ring */}
                <View style={styles.imgTapHint} pointerEvents="none">
                  <View style={styles.imgTapRing} />
                </View>
              </Animated.View>
            </GestureDetector>
          </Animated.View>

          {/* Podium reflection — color-adaptive ellipse */}
          <View style={styles.shadow}>
            <Svg width={SW * 0.55} height={32} viewBox={`0 0 ${SW * 0.55} 32`}>
              <Defs>
                <RadialGradient id="pg" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor={dynGlow} stopOpacity={0.35} />
                  <Stop offset="50%" stopColor={dynGlow} stopOpacity={0.08} />
                  <Stop offset="100%" stopColor={dynBG} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Ellipse cx={SW * 0.275} cy={16} rx={SW * 0.275} ry={16} fill="url(#pg)" />
            </Svg>
          </View>

          {/* Orbit ring hint */}
          <View style={styles.orbitRing} pointerEvents="none" />

          {/* Orbiting benefit pills */}
          {pills.map((b, i) => (
            <OrbitPill
              key={`${b.short}-${i}`}
              benefit={b}
              index={i}
              total={pills.length}
              orbitAngle={orbitAngle}
              selectedIdx={selectedIdx}
              jsSelected={jsSelectedIdx === i}
              onTap={handlePillTap}
            />
          ))}

          {/* Swipe hint */}
          <View style={styles.swipeHint} pointerEvents="none">
            <Text style={styles.swipeText}>↔ swipe to explore · tap product to zoom</Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Detail card */}
      <DetailCard benefit={detailBenefit} visible={showDetail} />

      {/* Lightbox */}
      <ImageLightbox
        source={imageSource}
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  podium: { width: PODIUM_W, height: PODIUM_H, position: 'relative' },

  // Glow
  glow: {
    position: 'absolute',
    left: CX - SW * 0.31,
    top: CY - SW * 0.31,
    width: SW * 0.62,
    height: SW * 0.62,
    zIndex: 0,
  },

  // Image
  imgWrap: {
    position: 'absolute',
    left: CX - IMG_W / 2,
    top: CY - IMG_H / 2,
    width: IMG_W,
    height: IMG_H,
    zIndex: 1,
  },
  img: { width: IMG_W, height: IMG_H },
  edgeFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  imgTapHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgTapRing: {
    width: IMG_W * 0.7,
    height: IMG_W * 0.7,
    borderRadius: IMG_W * 0.35,
    borderWidth: 0.5,
    borderColor: 'rgba(201, 169, 110, 0.08)',
  },

  // Shadow
  shadow: {
    position: 'absolute',
    left: CX - SW * 0.275,
    top: CY + IMG_H / 2 - 4,
    zIndex: 4,
  },

  // Orbit ring hint
  orbitRing: {
    position: 'absolute',
    left: CX - ORB_RX,
    top: CY - ORB_RY,
    width: ORB_RX * 2,
    height: ORB_RY * 2,
    borderRadius: ORB_RX,
    borderWidth: 0.5,
    borderColor: 'rgba(201, 169, 110, 0.06)',
    zIndex: 1,
  },

  // Circle aura glow
  pillAura: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: GOLD_GLOW,
    top: -9,
    left: -9,
    zIndex: -1,
  },

  // Dark circle pill
  pillCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pillIconWrap: { marginBottom: 3, alignItems: 'center' as const },
  pillLabelWrap: {
    width: 60,
    overflow: 'hidden' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'center' as const,
  },
  pillLabelSlider: {
    flexDirection: 'row' as const,
    flexShrink: 0,
    paddingLeft: 4,
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },

  // Swipe hint
  swipeHint: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  swipeText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.16)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Detail card
  detailCard: {
    width: PODIUM_W - 24,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.15)',
  },
  detailBlur: { borderRadius: radius.lg, overflow: 'hidden' },
  detailInner: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(201, 169, 110, 0.04)',
    alignItems: 'center',
  },
  detailIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.sm,
  },
  detailTitle: {
    ...typography.headline,
    color: colors.gold[500],
    textAlign: 'center',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Lightbox
  lightboxBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    bottom: 60,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  lightboxCloseBlur: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  lightboxCloseText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lightboxImgWrap: {
    width: SW * 0.85,
    height: SH * 0.65,
  },
  lightboxImg: {
    width: '100%',
    height: '100%',
  },
  lightboxRing: {
    position: 'absolute',
    width: SW * 0.7,
    height: SW * 0.7,
    borderRadius: SW * 0.35,
    borderWidth: 0.5,
    borderColor: 'rgba(201, 169, 110, 0.1)',
  },
});
