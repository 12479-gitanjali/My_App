import { SignOutButton } from "@/components/SignOutButton";
import { AuthContext } from "@/contexts/AuthContext";
import { DbContext } from "@/contexts/DbContext";
import { ThemeContext } from "@/contexts/ThemeContext"; 
import { useRouter, useNavigation } from "expo-router";
import React, { useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { collection, query, getDocs, deleteDoc } from "firebase/firestore";

const Settings: React.FC = () => {
    const auth = useContext(AuthContext);
    const db = useContext(DbContext);
    const { theme, toggleTheme } = useContext(ThemeContext); 
    const router = useRouter();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerRight: () => <SignOutButton />
        });
    }, [navigation]);

    const eraseData = () => {
        Alert.alert(
            "Confirm Erase",
            "Are you sure you want to erase all data?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            const authUser = auth.currentUser.uid;

                            // Erase expenses
                            const expensesPath = `users/${authUser}/expenses`;
                            const expensesQuery = query(collection(db, expensesPath));
                            const expensesSnapshot = await getDocs(expensesQuery);
                            expensesSnapshot.forEach(async (doc) => {
                                await deleteDoc(doc.ref);
                            });

                            // Erase income
                            const incomePath = `users/${authUser}/income`;
                            const incomeQuery = query(collection(db, incomePath));
                            const incomeSnapshot = await getDocs(incomeQuery);
                            incomeSnapshot.forEach(async (doc) => {
                                await deleteDoc(doc.ref);
                            });

                            alert('Data erased successfully!');
                        } catch (error) {
                            console.error("Error erasing data: ", error);
                            alert('Failed to erase data. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme === 'light' ? '#fff' : '#333' }]}>
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.header}>Erase Data</Text>
                    <TouchableOpacity onPress={eraseData} style={styles.iconButton}>
                        <FontAwesome name="trash" size={24} color="#FF6347" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={[styles.header, { color: theme === 'light' ? '#000' : '#fff' }]}>Theme</Text>
                    <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
                        <FontAwesome name={theme === 'light' ? 'sun-o' : 'moon-o'} size={24} color="#4682B4" />
                    </TouchableOpacity>
                </View>
            </View>
            
            {/* New Section for Notification Preferences */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={[styles.header, { color: theme === 'light' ? '#000' : '#fff' }]}>Notifications</Text>
                    <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconButton}>
                        <FontAwesome name="bell" size={24} color="#4682B4" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        alignItems: 'flex-start',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 10,
    },
});

export default Settings;
