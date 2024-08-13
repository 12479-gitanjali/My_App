import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { AuthContext } from '@/contexts/AuthContext';
import { DbContext } from '@/contexts/DbContext';
import { doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';

interface Idoc {
    id: string;
    goal: string;
    amount: number;
    createdAt: string;
}

export default function GoalDetail() {
    const db = useContext(DbContext);
    const auth = useContext(AuthContext);
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const goalId: string = params.goalId as string;

    const [document, setDocument] = useState<Idoc | null>(null);
    const [deductionAmount, setDeductionAmount] = useState<string>(''); 
    const [showDeductionInput, setShowDeductionInput] = useState(false); 

    useEffect(() => {
        navigation.setOptions({ headerShown: true });
        getDocument(goalId);
    }, [navigation]);

    const getDocument = async (documentId: string) => {
        const docRef = doc(db, `users/${auth.currentUser.uid}/goals`, documentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setDocument({ id: docSnap.id, ...docSnap.data() } as Idoc);
        } else {
            console.error("No such document!");
        }
    };

    const deleteDocument = async () => {
        if (document) {
            const docRef = doc(db, `users/${auth.currentUser.uid}/goals`, goalId);
            await deleteDoc(docRef);
            Alert.alert('Success', 'Goal deleted successfully!');
            navigation.goBack();
        }
    };

    const addDeduction = async () => {
        if (document) {
            const parsedDeduction = parseFloat(deductionAmount);
            if (isNaN(parsedDeduction) || parsedDeduction <= 0) {
                Alert.alert('Error', 'Please enter a valid deduction amount.');
                return;
            }
            const newAmount = document.amount - parsedDeduction;

            if (newAmount < 0) {
                Alert.alert('Error', 'Deduction exceeds the current amount.');
                return;
            }

            // Update Firestore document with the new amount
            await setDoc(doc(db, `users/${auth.currentUser.uid}/goals`, document.id), {
                ...document,
                amount: newAmount,
            });
            Alert.alert('Success', 'Amount deducted successfully!');
            setDeductionAmount(''); 
            setShowDeductionInput(false); 
            getDocument(goalId); 
        }
    };

    if (document) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Goal</Text>
                <TextInput 
                    value={document.goal} 
                    style={styles.input} 
                    editable={false} 
                />
                <Text style={styles.title}>Amount</Text>
                <TextInput 
                    inputMode='numeric'
                    value={document.amount.toString()} 
                    style={styles.input} 
                    editable={false} 
                />
                <Text>Created on: {new Date(document.createdAt).toLocaleString()}</Text>
                
                {/* Button to toggle the deduction input visibility */}
                <Pressable
                    style={styles.addButton}
                    onPress={() => setShowDeductionInput(true)}
                >
                    <Text style={styles.buttonText}>Add Amount</Text>
                </Pressable>

                {/* Conditionally render the deduction input */}
                {showDeductionInput && (
                    <View style={styles.deductionContainer}>
                        <Text style={styles.title}>Add Amount</Text>
                        <TextInput 
                            inputMode='numeric'
                            value={deductionAmount} 
                            style={styles.input} 
                            onChangeText={setDeductionAmount} 
                        />
                        <Pressable 
                            onPress={addDeduction} 
                            style={styles.addButton}
                        >
                            <Text style={styles.buttonText}>Submit Amount</Text>
                        </Pressable>
                    </View>
                )}

                <View style={styles.buttonsRow}>
                    <Pressable onPress={deleteDocument} style={styles.deleteButton}>
                        <Text style={styles.buttonText}>Delete</Text>
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
    addButton: {
        padding: 10,
        backgroundColor: "#007BFF", 
        borderRadius: 10,
    },
    deductionContainer: {
        marginVertical: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 10,
        backgroundColor: '#f8f8f8',
    },
    buttonText: {
        color: "#ffffff", 
    },
});
