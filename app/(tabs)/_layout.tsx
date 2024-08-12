import { Tabs } from "expo-router";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { AntDesign } from '@expo/vector-icons';
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: "#ff7157" }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="wallet" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: "Income",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="plus-circle" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          title: "Setting",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
