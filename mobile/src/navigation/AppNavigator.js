import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

import HomeScreen from '../screens/main/HomeScreen';
import ListingDetailScreen from '../screens/main/ListingDetailScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import OrdersScreen from '../screens/main/OrdersScreen';
import OrderDetailScreen from '../screens/main/OrderDetailScreen';
import BusinessProfileScreen from '../screens/main/BusinessProfileScreen';

import MyShopScreen from '../screens/smme/MyShopScreen';
import CreateListingScreen from '../screens/smme/CreateListingScreen';
import CreateBusinessScreen from '../screens/smme/CreateBusinessScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Marketplace' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: 'Orders' }} />
      <Tab.Screen
        name="MyShop"
        component={MyShopScreen}
        options={{
          tabBarLabel: 'My Shop',
          tabBarItemStyle: user?.role !== 'smme' ? { display: 'none' } : {},
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ListingDetail" component={ListingDetailScreen}
              options={{ headerShown: true, title: 'Listing' }} />
            <Stack.Screen name="CreateListing" component={CreateListingScreen}
              options={{ headerShown: true, title: 'Add Listing' }} />
            <Stack.Screen
              name="BusinessProfile"
              component={BusinessProfileScreen}
              options={{ headerShown: true, title: 'Business Profile' }}
            />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen}
              options={{ headerShown: true, title: 'Order Details' }} />
            <Stack.Screen name="CreateBusiness" component={CreateBusinessScreen}
              options={{ headerShown: true, title: 'Business Profile' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;