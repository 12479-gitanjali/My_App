// app/Settings.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SignOutButton } from '@/components/SignOutButton';

const SettingsScreen = () => {
    return (
        <View style={styles.centeredView}>
            <Text>Settings!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SettingsScreen;
