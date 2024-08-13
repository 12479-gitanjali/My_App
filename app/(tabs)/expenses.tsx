import { SignOutButton } from "@/components/SignOutButton";
import { AuthContext } from "@/contexts/AuthContext";
import { DbContext } from "@/contexts/DbContext";
import { useTheme } from "@/contexts/ThemeContext"; // Import ThemeContext
import { Ionicons } from "@expo/vector-icons";
import { Link, useNavigation, useRouter } from "expo-router";
import { addDoc, collection, query, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Modal, TextInput, Alert } from 'react-native'; // Import Alert

interface ExpenseItem {
    id: string;
    time: number;
    amount: number;
    expenses: string;
}

export default function Expenses() {
    const auth = useContext(AuthContext);
    const db = useContext(DbContext);
    const { theme } = useTheme();
    const router = useRouter();
    const navigation = useNavigation();

    const [data, setData] = useState<ExpenseItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [expenses, setExpenses] = useState('');
    const [amount, setAmount] = useState('');
    const [totalExpenses, setTotalExpenses] = useState(0);

    // Show the header via setOptions()
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerRight: () => <SignOutButton />
        });
    }, [navigation]);

    useEffect(() => {
        if (!loaded) {
            fetchData();
            setLoaded(true);
        }
    }, [data, auth]);

    useEffect(() => {
        setExpenses('');
        setAmount('');
    }, [modalVisible]);

    useEffect(() => {
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        setTotalExpenses(total);
    }, [data]);

    const addData = async () => {
        if (!expenses || !amount) {
            Alert.alert("Validation Error", "Please enter both expense description and amount.");
            return; // Exit the function early
        }
        const data = {
            time: new Date().getTime(),
            amount: parseInt(amount),
            expenses: expenses
        };
        const authUser = auth.currentUser.uid;
        const path = `users/${authUser}/expenses`;

        try {
            const docRef = await addDoc(collection(db, path), data);
            await addDoc(collection(db, `users/${authUser}/notifications`), {
                message: `Expense "${expenses}" of $${amount} added.`,
                date: new Date(),
                type: 'expense',
                expenseId: docRef.id, 
            });
            Alert.alert("Success", `Expense "${expenses}" of $${amount} added.`); // Alert on success
        } catch (error) {
            Alert.alert("Error", "Failed to add expense. Please try again."); // Alert on error
        }
    };

    const fetchData = async () => {
        const path = `users/${auth.currentUser.uid}/expenses`;
        const q = query(collection(db, path));
        onSnapshot(q, (querySnapshot) => {
            let items: ExpenseItem[] = []; // Ensure items is an array of ExpenseItem
            querySnapshot.forEach((doc) => {
                let item = doc.data() as ExpenseItem; // Cast to ExpenseItem
                item.id = doc.id; // Add the document ID
                items.push(item);
            });
            setData(items);
        });
    };

    const ListItem = ({ expenses, amount, id }: ExpenseItem) => { // Destructure props
        return (
            <View style={[styles.listItem, { backgroundColor: theme === 'light' ? "#15bfe6" : "#555" }]}>
                <Text style={[styles.expenseText, { color: theme === 'light' ? '#000' : '#fff' }]}>{expenses}</Text>
                <Text style={[styles.amountText, { color: theme === 'light' ? 'gray' : '#ccc' }]}>${amount}</Text>
                <Link href={{ pathname: "/detail", params: { id } }}>
                    <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>Detail</Text>
                </Link>
            </View>
        );
    };

    const Separator = () => {
        return (
            <View style={styles.separator}></View>
        );
    };

    const renderItem = ({ item }: { item: ExpenseItem }) => (
        <ListItem expenses={item.expenses} amount={item.amount} id={item.id} time={0} />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme === 'light' ? '#fff' : '#333' }]}>
            <View style={[styles.totalContainer, { backgroundColor: theme === 'light' ? "#FFC300" : "#1a1a1a" }]}>
                <Text style={[styles.totalText, { color: theme === 'light' ? '#000' : '#fff' }]}>Total Expenses: ${totalExpenses}</Text>
            </View>
            <Text style={styles.goalsTitle}>My Expenses</Text>
            <Pressable
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addButtonText}>
                    <Ionicons name="add" size={24} />
                </Text>
            </Pressable>
            
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={Separator}
                style={styles.list}
            />
            
            <Modal
                animationType="fade"
                transparent={false}
                visible={modalVisible}
            >
                <View style={[styles.modal, { backgroundColor: theme === 'light' ? '#fff' : '#333' }]}>
                    <View style={styles.modalContainer}>
                        <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>Enter Expenses</Text>
                        <TextInput 
                            style={styles.modalInput} 
                            value={expenses} 
                            onChangeText={(val) => setExpenses(val)} 
                            placeholder="Enter expenses"
                            placeholderTextColor={theme === 'light' ? '#aaa' : '#777'}
                        />
                        <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>Enter Amount</Text>
                        <TextInput 
                            style={styles.modalInput} 
                            inputMode="numeric" 
                            value={amount} 
                            onChangeText={(val) => setAmount(val)} 
                            placeholder="Enter amount"
                            placeholderTextColor={theme === 'light' ? '#aaa' : '#777'}
                        />
                        <Pressable
                            style={styles.addItemButton}
                            onPress={() => {
                                addData();
                                setModalVisible(false);
                            }}
                        >
                            <Text style={styles.addItemText}>Add Expenses</Text>
                        </Pressable>
                    </View>
                    <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
                        <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>Close</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    addButton: {
        backgroundColor: "#333333",
        padding: 8,
        alignSelf: "center",
        width: 40,
        height: 40,
        borderRadius: 5,
        position: "absolute",
        right: 20,
        bottom: 20,
        zIndex: 999,
        justifyContent: "center",
        alignItems: "center"
    },
    addButtonText: {
        color: "#eeeeee",
        textAlign: "center",
        fontSize: 30,
    },
    listItem: {
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        borderRadius: 10, 
        elevation: 4, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 4, 
    },
    separator: {
        backgroundColor: "#EEEEEE",
        height: 4,
    },
    list: {
        flex: 12,
    },
    modal: {
        padding: 20,
        flex: 1,
    },
    modalClose: {
        position: "absolute",
        right: 20,
        top: 20,
    },
    modalContainer: {
        flex: 1,
        marginVertical: 50
    },
    addItemButton: {
        backgroundColor: "#12ed0e",
        padding: 8,
        alignSelf: "center",
    },
    addItemText: {
        color: "#0c120c",
        textAlign: "center",
    },
    modalInput: {
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#CCCCCC",
        padding: 8,
        marginBottom: 20,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expenseText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    amountText: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 5 // Adjust margin as needed
    },
    totalContainer: {
        padding: 20,
        alignItems: "center",
        marginBottom: 20,
        borderRadius: 20, 
        elevation: 6, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 4, 
        marginTop: 20,
        marginHorizontal: 10,
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    goalsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 20,
    },
});
