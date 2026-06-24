// =====================================================================
//  FYP Archive — Mobile App (React Native + Expo)
//  Root component: loads fonts, provides auth, and routes between the
//  auth screens (logged out) and the main app (logged in).
// =====================================================================
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useFonts } from 'expo-font';
import { Fraunces_500Medium, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerifyScreen from './src/screens/VerifyScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import AdminScreen from './src/screens/AdminScreen';
import ApprovalsScreen from './src/screens/ApprovalsScreen';
import MyRequestsScreen from './src/screens/MyRequestsScreen';
import { colors, fonts } from './src/theme';

const Stack = createNativeStackNavigator();

// Shared header styling for the academic-archive look.
const screenOptions = {
  headerStyle: { backgroundColor: colors.parchment },
  headerShadowVisible: false,
  headerTintColor: colors.ink,
  headerTitleStyle: { fontFamily: fonts.displaySemiBold, color: colors.ink },
  contentStyle: { backgroundColor: colors.parchment },
};

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {user ? (
          <>
            <Stack.Screen name="Browse" component={BrowseScreen} options={{ title: 'Archive' }} />
            <Stack.Screen
              name="ProjectDetail"
              component={ProjectDetailScreen}
              options={{ title: 'Project', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="Admin"
              component={AdminScreen}
              options={{ title: 'Manage Archive', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="Approvals"
              component={ApprovalsScreen}
              options={{ title: 'Approvals', headerBackTitle: 'Back' }}
            />
            <Stack.Screen
              name="MyRequests"
              component={MyRequestsScreen}
              options={{ title: 'My Requests', headerBackTitle: 'Back' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '', headerBackTitle: 'Back' }} />
            <Stack.Screen name="Verify" component={VerifyScreen} options={{ title: '', headerBackTitle: 'Back' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.parchment },
});
