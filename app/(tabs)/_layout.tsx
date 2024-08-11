// app/_layout.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './Home';
import AccountScreen from './account';
import SettingsScreen from './setting';
import { FontAwesome5 } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const AppLayout = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;

                        if (route.name === 'Home') {
                            iconName = 'home';
                        } else if (route.name === 'Account') {
                            iconName = 'user-circle';
                        } else if (route.name === 'Settings') {
                            iconName = 'cog';
                        }

                        return <FontAwesome5 name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: 'tomato',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Account" component={AccountScreen} />
                <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
            </NavigationContainer>
    );
};

export default AppLayout;
