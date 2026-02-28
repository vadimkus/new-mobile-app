import { Linking } from 'react-native';
import { router } from 'expo-router';

const ALLOWED_HOSTS = ['genosys.ae', 'www.genosys.ae'];
const ALLOWED_SCHEMES = ['genosys://', 'https://'];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'genosys:') return true;
    if (parsed.protocol === 'https:' && ALLOWED_HOSTS.includes(parsed.hostname)) return true;
    return false;
  } catch {
    return false;
  }
}

function mapUrlToRoute(url: string): string | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
    const segments = path.split('/');

    switch (segments[0]) {
      case 'products':
      case 'product':
        return segments[1] ? `/product/${segments[1]}` : '/(tabs)/discover';
      case 'cart':
      case 'bag':
        return '/(tabs)/bag';
      case 'orders':
        return segments[1] ? `/profile/orders/${segments[1]}` : '/profile/orders';
      case 'track':
        return segments[1] ? `/profile/orders/${segments[1]}` : '/profile/orders';
      case 'profile':
        return '/profile';
      case 'favorites':
        return '/profile/favorites';
      case 'checkout':
        return '/checkout';
      case 'skin-analysis':
      case 'skin-ai':
        return '/(tabs)/skin-ai';
      case 'ritual':
        return '/(tabs)/ritual';
      case 'discover':
      case 'shop':
        return '/(tabs)/discover';
      case 'about':
        return '/profile/about';
      case 'contact':
        return '/profile/contact';
      case 'help':
      case 'faq':
        return '/profile/help';
      case 'training':
        return '/profile/training';
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export function handleDeepLink(url: string) {
  if (!isAllowedUrl(url)) return;
  const route = mapUrlToRoute(url);
  if (route) router.push(route as any);
}

export function setupDeepLinkListener() {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });

  // Handle the URL that opened the app
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink(url);
  });

  return () => subscription.remove();
}
