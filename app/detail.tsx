import { Text, View, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useContext } from 'react';
import { DbContext } from '@/contexts/DbContext';
import { AuthContext } from '@/contexts/AuthContext';
import { doc, getDoc, deleteDoc, updateDoc } from '@firebase/firestore';
import { collection, setDoc } from 'firebase/firestore';
import React from 'react';

interface Idoc {
    amount: number;
    expenses: string;
    time: number;
}

export default function Detail() {
    const db = useContext(DbContext);
    const auth = useContext(AuthContext);
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const id: string = params.id as string;

    const [document, setDocument] = useState<Idoc | null>(null);
    const [modified, setModified] = useState(false);

    useEffect(() => {
        navigation.setOptions({ headerShown: true });
        getDocument(id);
    }, [navigation]);

    useEffect(() => {
        if (document) setModified(true);
    }, [document]);

    const getDocument = async (documentId: string) => {
        const docRef = doc(db, `users/${auth.currentUser.uid}/expenses`, documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setDocument(docSnap.data() as Idoc);
        } else {
            console.log("No such document!");
        }
        setModified(false);
    };

    const addNotification = async (message: string) => {
        const notificationsPath = `users/${auth.currentUser.uid}/notifications`;
        const notificationRef = doc(collection(db, notificationsPath));
        await setDoc(notificationRef, {
            message,
            date: Date.now(),
        });
    };

    const deleteDocument = async () => {
        if (document) {
            const docRef = doc(db, `users/${auth.currentUser.uid}/expenses`, id);
            await deleteDoc(docRef);
            await addNotification(`Deleted expense: ${document.expenses} for amount: ${document.amount}`);
            Alert.alert('Success', 'Expenses deleted successfully!');
            navigation.goBack();
        }
    };

    const updateDocument = async () => {
        if (document) {
            const docRef = doc(db, `users/${auth.currentUser.uid}/expenses`, id);
            await updateDoc(docRef, { time: document.time, expenses: document.expenses, amount: document.amount });
            await addNotification(`Updated expense: ${document.expenses} to amount: ${document.amount}`);
            Alert.alert('Success', 'Expense updated successfully!');
            navigation.goBack();
        }
    };

    const convertTimeStamp = (timestamp: number) => {
        const dateObj = new Date(timestamp);
        const yr = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const date = dateObj.getDate();
        const hour = dateObj.getHours();
        const min = dateObj.getMinutes();
        const sec = dateObj.getSeconds();
        return `${date}/${month}/${yr} ${hour}:${min}:${sec}`;
    };

    if (document) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Expenses</Text>
                <TextInput
                    value={document.expenses}
                    style={styles.input}
                    onChangeText={(val) => setDocument({ ...document, expenses: val })} // Update expenses correctly
                />
                <Text style={styles.title}>Amount</Text>
                <TextInput
                    inputMode='numeric'
                    value={document.amount.toString()}
                    style={styles.input}
                    onChangeText={(val) => setDocument({ ...document, amount: parseInt(val) })} // Ensure it's a number
                />
                <Text>Created on: {convertTimeStamp(document.time)}</Text>
                <View style={styles.buttonsRow}>
                    <Pressable onPress={deleteDocument} style={styles.deleteButton}>
                        <Text style={styles.buttonText}>Delete</Text>
                    </Pressable>
                    <Pressable
                        disabled={!modified}
                        style={modified ? styles.updateEnabled : styles.updateDisabled}
                        onPress={updateDocument}
                    >
                        <Text>Update</Text>
                    </Pressable>
                </View>
            </View>
        );
    } else {
        return null;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        fontSize: 20,
    },
    input: {
        padding: 5,
        borderColor: '#CCCCCC',
        borderStyle: 'solid',
        backgroundColor: '#d0d4cd',
        fontSize: 16,
        marginBottom: 20,
    },
    updateDisabled: {
        backgroundColor: "#cccccc",
        padding: 10,
        borderRadius: 10,
    },
    updateEnabled: {
        backgroundColor: "#41f241",
        padding: 10,
        borderRadius: 10,
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 20,
    },
    deleteButton: {
        padding: 10,
        backgroundColor: "#db1d29",
        borderRadius: 10,
    },
    buttonText: {
        color: "#0f0f0f",
    },
});
