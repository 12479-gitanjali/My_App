import { SignOutButton } from "@/components/SignOutButton"
import { AuthContext } from "@/contexts/AuthContext"
import { DbContext } from "@/contexts/DbContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useNavigation, Link } from "expo-router"
import { addDoc, collection, query, onSnapshot } from "firebase/firestore"
import React, { useContext, useState, useEffect } from "react"
import { View, Text, StyleSheet, Pressable, FlatList, Modal, TextInput } from 'react-native';

export default function income() {
    const auth = useContext(AuthContext)
    const db = useContext(DbContext)
    const router = useRouter()
    const navigation = useNavigation()

    const [data, setData] = useState([])
    const [loaded, setLoaded] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [income, setIncome] = useState('')
    const [amount, setAmount] = useState('')
    const [totalincome, setTotalincome] = useState(0);

    // showing the header via setOptions()
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerRight: () => <SignOutButton />
        })
    }, [navigation])

    useEffect(() => {
        if (loaded == false) {
            fetchData()
            setLoaded(true)
        }
    }, [data, auth])

    useEffect( () => {
        setIncome('')
        setAmount('')
    }, [modalVisible])

    useEffect(() => {
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        setTotalincome(total);
    }, [data]);


    const addData = async () => {
        const data = {
            time: new Date().getTime(),
            amount: parseInt(amount),
            income: income
        }
        const authUser = auth.currentUser.uid
        const path = `users/${authUser}/income`
        const docRef = await addDoc(collection(db, path), data)
    }

    const fetchData = async () => {
        const path = `users/${auth.currentUser.uid}/income`
        const q = query(collection(db, path))
        const unsub = onSnapshot(q, (querySnapshot) => {
            let items: any = []
            querySnapshot.forEach((doc) => {
                let item = doc.data()
                item.id = doc.id
                items.push(item)
            })
            setData(items)
        })

    }

    const ListItem = (props: any) => {
        return (
            <View style={styles.listItem}>
                <Text style={styles.expenseText}>{props.income}</Text>
                <Text style={styles.amountText}>${props.amount}</Text>
                <Link href={{ pathname: "/incomedetails", params: { id: props.id } }}>
                    <Text>Detail</Text>
                </Link>
            </View>
        )
    }

    const Separator = () => {
        return (
            <View style={styles.separator}></View>
        )
    }

    const renderItem = ({ item }: any) => {
        return (
            <ListItem income={item.income} amount={item.amount} id={item.id} />
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total Income: ${totalincome}</Text>
            </View>
            <Pressable
                style={styles.addButton}
                //onPress={() => addData()} 
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addButtonText}>
                    <Ionicons name="add" size={24} />
                </Text>
            </Pressable>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item: any) => item.id}
                ItemSeparatorComponent={Separator}
                style={styles.list}
            />
            <Modal
                animationType="fade"
                transparent={false}
                visible={modalVisible}
            >
                <View style={styles.modal}>
                    <View style={styles.modalContainer}>
                        <Text>Enter Income</Text>
                        <TextInput style={styles.modalInput} value={income} onChangeText={(val) => setIncome(val)} />
                        <Text>Enter Amount</Text>
                        <TextInput style={styles.modalInput} inputMode="numeric" value={amount} onChangeText={(val) => setAmount(val)} />
                        <Pressable
                            style={styles.addItemButton}
                            onPress={() => {
                                addData()
                                setModalVisible(false)
                            }
                            }>
                            <Text style={styles.addItemText}>Add Income</Text>
                        </Pressable>
                    </View>
                    <Pressable style={styles.modalClose} onPress={() => setModalVisible(false)}>
                        <Text>Close</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    )
};

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
        backgroundColor: "#15bfe6",
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
        backgroundColor: "#59D304",
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