// Notifications.tsx
import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { AuthContext } from "@/contexts/AuthContext";
import { DbContext } from "@/contexts/DbContext";
import { collection, query, onSnapshot } from "firebase/firestore";

const Notifications: React.FC = () => {
    const auth = useContext(AuthContext);
    const db = useContext(DbContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const authUser = auth.currentUser.uid;
        const notificationsPath = `users/${authUser}/notifications`; // Adjust path as necessary

        const unsubscribe = onSnapshot(query(collection(db, notificationsPath)), (snapshot) => {
            const fetchedNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(fetchedNotifications);
        });

        return () => unsubscribe();
    }, [auth.currentUser.uid, db]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Notifications</Text>
            {notifications.length === 0 ? (
                <Text style={styles.noNotifications}>No notifications available.</Text>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.notification}>
                            <Text>{item.message}</Text>
                            <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    noNotifications: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: '#999',
    },
    notification: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
});

export default Notifications;
