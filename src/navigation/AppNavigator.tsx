/**
 * Holy Culture Radio - Main App Navigator
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';

import { colors } from '../theme';
import { RootStackParamList, BottomTabParamList } from '../types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import RadioScreen from '../screens/RadioScreen';
import DevotionalsScreen from '../screens/DevotionalsScreen';
import DevotionalDetailScreen from '../screens/DevotionalDetailScreen';
import PodcastsScreen from '../screens/PodcastsScreen';
import PodcastPlayerScreen from '../screens/PodcastPlayerScreen';
import MusicScreen from '../screens/MusicScreen';
import ForumScreen from '../screens/ForumScreen';
import ForumPostScreen from '../screens/ForumPostScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Components
import TabBarIcon from '../components/TabBarIcon';
import MiniPlayer from '../components/MiniPlayer';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.background,
  },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: {
    fontWeight: '600' as const,
  },
  contentStyle: {
    backgroundColor: colors.background,
  },
};

function TabNavigator() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon routeName={route.name} focused={focused} color={color} size={size} />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerStyle: {
            backgroundColor: colors.background,
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Holy Culture',
            headerTitle: 'Holy Culture Radio',
          }}
        />
        <Tab.Screen
          name="Radio"
          component={RadioScreen}
          options={{
            title: 'Radio',
            headerTitle: 'Live Radio',
          }}
        />
        <Tab.Screen
          name="Devotionals"
          component={DevotionalsScreen}
          options={{
            title: 'Devotionals',
            headerTitle: 'Daily Devotionals',
          }}
        />
        <Tab.Screen
          name="Podcasts"
          component={PodcastsScreen}
          options={{
            title: 'Podcasts',
            headerTitle: 'Podcasts',
          }}
        />
        <Tab.Screen
          name="Music"
          component={MusicScreen}
          options={{
            title: 'Music',
            headerTitle: 'Music',
          }}
        />
        <Tab.Screen
          name="Forum"
          component={ForumScreen}
          options={{
            title: 'Community',
            headerTitle: 'Community Forum',
          }}
        />
      </Tab.Navigator>
      <MiniPlayer />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RadioPlayer"
          component={RadioScreen}
          options={{
            title: 'Now Playing',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="DevotionalDetail"
          component={DevotionalDetailScreen}
          options={{
            title: 'Devotional',
          }}
        />
        <Stack.Screen
          name="PodcastPlayer"
          component={PodcastPlayerScreen}
          options={{
            title: 'Now Playing',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="ForumPost"
          component={ForumPostScreen}
          options={{
            title: 'Discussion',
          }}
        />
        <Stack.Screen
          name="CreatePost"
          component={CreatePostScreen}
          options={{
            title: 'Create Post',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.backgroundSecondary,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    height: Platform.OS === 'ios' ? 88 : 64,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
});
