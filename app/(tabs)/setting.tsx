import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';


const Tab = createBottomTabNavigator();

interface TabBarProps {  }

const HomeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>
    </View>
  );
}

const AccountScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Account!</Text>
    </View>
  );
}

const SettingScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>
    </View>
  );
}

interface Theme {
  backgroundColor: string;
  textColor: string;
}

const lightTheme: Theme = {
  backgroundColor: '#FFF',
  textColor: '#000',
};

const darkTheme: Theme = {
  backgroundColor: '#000',
  textColor: '#FFF',
};

function SettingsScreen() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === lightTheme ? darkTheme : lightTheme);
  };

  const eraseAllData = () => {
    // Implement logic to erase all data
    console.warn('Erase all data functionality not implemented yet');
  };

  const handleLogout = () => {
    // Implement logic to log out user and navigate to sign-in screen
    console.warn('Log out functionality not implemented yet');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <Pressable style={styles.button} onPress={toggleTheme}>
        <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>Theme</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={eraseAllData}>
        <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>Erase All</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={[styles.buttonText, { color: currentTheme.textColor }]}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#DDD',
    padding: 15,
    margin: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
  },
});


export default function App() {
  return (
    <Tab.Navigator
         screenOptions={({ route }) => ({
         tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Account') {
            iconName = 'circle';
          } else if (route.name === 'Settings') {  
            iconName = 'cog';
          }

          // Return the icon component based on the route name
          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Settings" component={SettingScreen} />
    </Tab.Navigator>
  );
}