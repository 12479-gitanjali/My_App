import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native'
import { AuthContext } from '@/contexts/AuthContext'
import { useContext, useEffect, useState } from 'react'
import { useRouter, Link } from 'expo-router'
import { DbContext } from '@/contexts/DbContext'
import { collection, addDoc, where, query, onSnapshot } from "firebase/firestore"
import { useNavigation } from 'expo-router'
import { SignOutButton } from '@/components/SignOutButton'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons'

export default function Home(props: any) {
    const auth = useContext(AuthContext)
    const db = useContext(DbContext)
    const router = useRouter()
    const navigation = useNavigation()

    const [data, setData] = useState([])
    const [loaded, setLoaded] = useState(false)

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
    
    return (
        <Tab.Navigator
         screenOptions={({ route }) => ({
         tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Account') {
            iconName = 'user';
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



const styles = StyleSheet.create({
    addButton: {
        backgroundColor: "#333333",
        padding: 8,
        alignSelf: "center",
        width: 200,
        borderRadius: 5,
    },
    addButtonText: {
        color: "#eeeeee",
        textAlign: "center",
    },
    listItem: {
        backgroundColor: "#CCCCCC",
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    separator: {
        backgroundColor: "#EEEEEE",
        height: 3,
    },
    list: {
        flex: 1,
    }
    
})