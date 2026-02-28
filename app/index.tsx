import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check auth state — if logged in, redirect to discover; otherwise login
  return <Redirect href="/auth/login" />;
}
