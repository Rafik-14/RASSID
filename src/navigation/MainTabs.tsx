import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Truck, Banknote, Store as StoreIcon } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { c } from '@/components/tokens';
import type { MainTabParamList } from './types';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { StoresScreen } from '@/screens/StoresScreen';
import { DeliveriesScreen } from '@/screens/DeliveriesScreen';
import { PaymentsScreen } from '@/screens/PaymentsScreen';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator<MainTabParamList>();

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom || 24 }]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(15,15,15,0.4)', 'rgba(10,10,10,0.85)', '#0A0A0A']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(10,10,10,0.5)' }]} />
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let IconComponent;
          let label;
          if (route.name === 'Dashboard') { IconComponent = Home; label = 'Accueil'; }
          else if (route.name === 'Deliveries') { IconComponent = Truck; label = 'Livraisons'; }
          else if (route.name === 'Payments') { IconComponent = Banknote; label = 'Paiements'; }
          else if (route.name === 'Stores') { IconComponent = StoreIcon; label = 'Magasins'; }

          return (
            <Pressable
              key={index}
              onPress={onPress}
              style={styles.tabItem}
            >
              {IconComponent && (
                <IconComponent
                  size={20}
                  color={isFocused ? c.white : c.white40}
                  strokeWidth={isFocused ? 2.4 : 1.8}
                />
              )}
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
              <View style={styles.dotContainer}>
                {isFocused && <Animated.View style={styles.activeDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Deliveries" component={DeliveriesScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Stores" component={StoresScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  tabBarInner: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
  },
  tabLabelActive: {
    color: c.white,
    fontFamily: 'Inter_600SemiBold',
  },
  dotContainer: {
    height: 4,
    width: '100%',
    alignItems: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.lime,
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
});
