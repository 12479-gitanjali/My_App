import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { AuthContext } from "@/contexts/AuthContext";
import { DbContext } from "@/contexts/DbContext";
import { collection, query, onSnapshot, deleteDoc, doc } from "firebase/firestore"; // Import doc
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useState, useEffect } from "react";

const Notifications: React.FC = () => {
    const auth = useContext(AuthContext);
    const db = useContext(DbContext);
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const authUser = auth.currentUser.uid;
        const notificationsPath = `users/${authUser}/notifications`;
    
        const unsubscribe = onSnapshot(query(collection(db, notificationsPath)), (snapshot) => {
            const fetchedNotifications = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    message: data.message || "No message",
                    date: data.date || Date.now()
                };
            });

            setNotifications(fetchedNotifications);
        }, (error) => {
            console.error("Error fetching notifications: ", error);
        });
    
        return () => unsubscribe();
    }, [auth.currentUser.uid, db]);

    // Corrected function to delete a notification
    const deleteNotification = async (id: string) => {
        const authUser = auth.currentUser.uid;
        const notificationPath = `users/${authUser}/notifications/${id}`;
        const notificationRef = doc(db, notificationPath); // Create a document reference

        Alert.alert(
            "Delete Notification",
            "Are you sure you want to delete this notification?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await deleteDoc(notificationRef); // Use the document reference
                        } catch (error) {
                            console.error("Error deleting notification: ", error);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="chevron-left" size={24} color="#4682B4" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>
            {notifications.length === 0 ? (
                <Text style={styles.noNotifications}>No notifications available.</Text>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.notification}>
                            <View style={styles.notificationContent}>
                                <Text style={styles.notificationText}>{item.message}</Text>
                                <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
                            </View>
                            <TouchableOpacity onPress={() => deleteNotification(item.id)}>
                                <FontAwesome name="trash" size={24} color="#FF6347" />
                            </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        paddingRight: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1, // Makes title take the remaining space
        textAlign: 'center',
    },
    noNotifications: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: '#999',
    },
    notification: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Aligns content to space out
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center', // Center the items vertically
    },
    notificationContent: {
        flex: 1, // Makes the notification text take available space
        marginRight: 10, // Space between text and delete icon
    },
    notificationText: {
        fontSize: 16,
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
});

export default Notifications;
