import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native'
import { firebaseConfig } from '@/config/Config'
import { initializeApp } from '@firebase/app'
import { getAuth } from '@firebase/auth'
import { AuthContext } from '@/contexts/AuthContext';
import { DbContext } from '@/contexts/DbContext';
import { getFirestore } from '@firebase/firestore'
import React from 'react';
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {
  // initialize firebase
  const FBapp = initializeApp(firebaseConfig)
  // intitialize firebase auth
  const FBauth = getAuth(FBapp)
  // initialize firebase firestore
  const FBdb = getFirestore(FBapp)

  return (
    <AuthContext.Provider value={FBauth}>
      <DbContext.Provider value={FBdb}>
      <GestureHandlerRootView style={styles.container}>
          <SafeAreaView style={styles.container}>
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
        </GestureHandlerRootView>
      </DbContext.Provider>
    </AuthContext.Provider>

  
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  }
})