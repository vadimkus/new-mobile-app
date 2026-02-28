import { Tabs } from 'expo-router';
import { colors } from '../../constants/theme';
import GlassTabBar from '../../components/ui/GlassTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
      <Tabs.Screen name="ritual" options={{ title: 'Ritual' }} />
      <Tabs.Screen name="skin-ai" options={{ title: 'Skin AI' }} />
      <Tabs.Screen name="bag" options={{ title: 'Bag' }} />
    </Tabs>
  );
}
