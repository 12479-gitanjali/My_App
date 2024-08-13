import { Text, View, Pressable, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useContext } from 'react';
import { DbContext } from '@/contexts/DbContext';
import { AuthContext } from '@/contexts/AuthContext';
import { doc, getDoc, deleteDoc, updateDoc } from '@firebase/firestore';
import { collection, setDoc } from 'firebase/firestore';
import React from 'react';

interface Idoc {
    id: string;
    amount: number;
    income: string;
    time: number;
}

export default function IncomeDetail() {
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
        if (document) {
            setModified(true);
        }
    }, [document]);

    const getDocument = async (documentId: string) => {
        const docRef = doc(db, `users/${auth.currentUser.uid}/income`, documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setDocument(docSnap.data() as Idoc);
        } else {
            console.error("No such document!");
        }
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
            const docRef = doc(db, `users/${auth.currentUser.uid}/income`, id);
            await deleteDoc(docRef);
            await addNotification(`Deleted income: ${document.income} for amount: ${document.amount}`);
            Alert.alert('Success', 'Income deleted successfully!');
            navigation.goBack();
        }
    };

    const updateDocument = async () => {
        if (document) {
            const docRef = doc(db, `users/${auth.currentUser.uid}/income`, id);
            await updateDoc(docRef, { time: document.time, income: document.income, amount: document.amount });
            await addNotification(`Updated income: ${document.income} to amount: ${document.amount}`);
            Alert.alert('Success', 'Income updated successfully!');
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
                <Text style={styles.title}>Income</Text>
                <TextInput 
                    value={document.income} 
                    style={styles.input} 
                    onChangeText={(val) => setDocument({ ...document, income: val })} // Update income correctly
                />
                <Text style={styles.title}>Amount</Text>
                <TextInput 
                    inputMode='numeric'
                    value={document.amount.toString()} 
                    style={styles.input} 
                    onChangeText={(val) => setDocument({ ...document, amount: parseFloat(val) })} // Ensure it's a number
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
    }
})