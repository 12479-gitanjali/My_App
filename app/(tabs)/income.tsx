import { SignOutButton } from "@/components/SignOutButton";
import { AuthContext } from "@/contexts/AuthContext";
import { DbContext } from "@/contexts/DbContext";
import { ThemeContext } from "@/contexts/ThemeContext"; // Import ThemeContext
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useNavigation, Link } from "expo-router";
import { addDoc, collection, query, onSnapshot } from "firebase/firestore";
import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Modal, TextInput } from 'react-native';

export default function Income() {
    const auth = useContext(AuthContext);
    const db = useContext(DbContext);
    const { theme } = useContext(ThemeContext); // Consume ThemeContext
    const router = useRouter();
    const navigation = useNavigation();

    const [data, setData] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [income, setIncome] = useState('');
    const [amount, setAmount] = useState('');
    const [totalIncome, setTotalIncome] = useState(0);

    // Showing the header via setOptions()
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
        setIncome('');
        setAmount('');
    }, [modalVisible]);

    useEffect(() => {
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        setTotalIncome(total);
    }, [data]);

    const addData = async () => {
        const data = {
            time: new Date().getTime(),
            amount: parseInt(amount),
            income: income
        };
        const authUser = auth.currentUser.uid;
        const path = `users/${authUser}/income`;
        const docRef = await addDoc(collection(db, path), data);
        await addDoc(collection(db, `users/${authUser}/notifications`), {
            message: `Income "${income}" of $${amount} added.`,
            date: new Date(),
            type: 'income',
            incomeId: docRef.id, 
        });    
    };

    const fetchData = async () => {
        const path = `users/${auth.currentUser.uid}/income`;
        const q = query(collection(db, path));
        onSnapshot(q, (querySnapshot) => {
            let items = [];
            querySnapshot.forEach((doc) => {
                let item = doc.data();
                item.id = doc.id;
                items.push(item);
            });
            setData(items);
        });
    };

    const ListItem = (props) => {
        return (
            <View style={[styles.listItem, { backgroundColor: theme === 'light' ? "#15bfe6" : "#555" }]}>
                <Text style={[styles.incomeText, { color: theme === 'light' ? '#000' : '#fff' }]}>{props.income}</Text>
                <Text style={[styles.amountText, { color: theme === 'light' ? 'gray' : '#ccc' }]}>${props.amount}</Text>
                <Link href={{ pathname: "/incomedetails", params: { id: props.id } }}>
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

    const renderItem = ({ item }) => {
        return (
            <ListItem income={item.income} amount={item.amount} id={item.id} />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme === 'light' ? '#fff' : '#333' }]}>
            <View style={[styles.totalContainer, { backgroundColor: theme === 'light' ? "#59D304" : "#1a1a1a" }]}>
                <Text style={[styles.totalText, { color: theme === 'light' ? '#000' : '#fff' }]}>Total Income: ${totalIncome}</Text>
            </View>
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
                        <Text style={{ color: theme === 'light' ? '#000' : '#fff' }}>Enter Income</Text>
                        <TextInput 
                            style={styles.modalInput} 
                            value={income} 
                            onChangeText={(val) => setIncome(val)} 
                            placeholder="Enter income"
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
                            <Text style={styles.addItemText}>Add Income</Text>
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
        flex: 1,
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
    incomeText: {
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
        borderRadius: 10,
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
});
