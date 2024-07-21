// SplashScreen1.tsx

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const SplashScreen1 = () => {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace('/splash2'); // Replace with next splash screen route
        }, 3000); // 3000 milliseconds = 3 seconds

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to MyApp</Text>
            <ActivityIndicator size="large" color="#b8111e" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default SplashScreen1;
