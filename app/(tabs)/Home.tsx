import { SignOutButton } from "@/components/SignOutButton";
import { AuthContext } from "@/contexts/AuthContext";
import { DbContext } from "@/contexts/DbContext";
import { Ionicons } from "@expo/vector-icons";
import { Link, useNavigation, useRouter } from "expo-router";
import { addDoc, collection, query, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { PieChart } from "react-native-chart-kit";

export default function Home() {
    const auth = useContext(AuthContext);
    const db = useContext(DbContext);
    const router = useRouter();
    const navigation = useNavigation();

    const [data, setData] = useState([]); // for expenses
    const [incomeData, setIncomeData] = useState([]); // for income
    const [loaded, setLoaded] = useState(false);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [remainingAmount, setRemainingAmount] = useState(0);

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            headerRight: () => <SignOutButton />
        });
    }, [navigation]);

    useEffect(() => {
        if (!loaded) {
            fetchData();
            fetchIncomeData();
            setLoaded(true);
        }
    }, [data, auth]);

    useEffect(() => {
        const totalExp = data.reduce((sum, item) => sum + item.amount, 0);
        setTotalExpenses(totalExp);
        setRemainingAmount(totalIncome - totalExp);
    }, [data, totalIncome]);

    useEffect(() => {
        const totalInc = incomeData.reduce((sum, item) => sum + item.amount, 0);
        setTotalIncome(totalInc);
        setRemainingAmount(totalInc - totalExpenses);
    }, [incomeData, totalExpenses]);

    const fetchData = async () => {
        const path = `users/${auth.currentUser.uid}/expenses`;
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

    const fetchIncomeData = async () => {
        const path = `users/${auth.currentUser.uid}/income`;
        const q = query(collection(db, path));
        onSnapshot(q, (querySnapshot) => {
            let items = [];
            querySnapshot.forEach((doc) => {
                let item = doc.data();
                item.id = doc.id;
                items.push(item);
            });
            setIncomeData(items);
        });
    };

    const chartData = [
        {
            name: "Expenses",
            amount: totalExpenses,
            color: "#FFC300",
            legendFontColor: "#000000",
            legendFontSize: 15,
        },
        {
            name: "Income",
            amount: totalIncome,
            color: "#59D304",
            legendFontColor: "#000000",
            legendFontSize: 15,
        },
    ];

    const renderTransactionItem = ({ item }) => (
        <View style={styles.transactionItem}>
            <Text style={styles.transactionText}>{item.description || item.income}</Text>
            <Text style={styles.transactionAmount}>${item.amount}</Text>
        </View>
    );

    const transactionList = [
        ...data.map(expense => ({ ...expense, description: expense.expenses })),
        ...incomeData.map(income => ({ ...income, description: income.income })),
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.remainingContainer}>
                <Text style={styles.remainingText}>Remaining Amount: ${remainingAmount}</Text>
                <View style={styles.innerContainer}>
                    <View style={styles.innerBoxExpenses}>
                        <Text style={styles.innerText}>Total Expenses</Text>
                        <Text style={styles.innerAmount}>${totalExpenses}</Text>
                    </View>
                    <View style={styles.innerBoxIncome}>
                        <Text style={styles.innerText}>Total Income</Text>
                        <Text style={styles.innerAmount}>${totalIncome}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <View style={styles.pieChartWrapper}>
                    <PieChart
                        data={chartData}
                        width={400}
                        height={220}
                        chartConfig={{
                            backgroundColor: "#fff",
                            backgroundGradientFrom: "#fff",
                            backgroundGradientTo: "#fff",
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: () => `#000000`,
                            style: {
                                borderRadius: 16,
                            },
                        }}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                </View>
            </View>

            <Text style={styles.transactionListTitle}>Transaction List</Text>
            <FlatList
                data={transactionList}
                renderItem={renderTransactionItem}
                keyExtractor={(item) => item.id}
                style={styles.transactionList}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    remainingContainer: {
        padding: 20,
        backgroundColor: "#15bfe6",
        alignItems: "center",
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        marginTop: 20,
        marginHorizontal: 10,
    },
    remainingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    innerBoxExpenses: {
        flex: 1,
        backgroundColor: '#FFC300',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 5,
        elevation: 2,
    },
    innerBoxIncome: {
        flex: 1,
        backgroundColor: '#59D304',
        padding: 10,
        borderRadius: 8,
        marginHorizontal: 5,
        elevation: 2,
    },
    innerText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    innerAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 5,
        color: '#000000',
    },
    chartContainer: {
        alignItems: "center",
        marginTop: 20,
        borderColor: '#000000',
    },
    pieChartWrapper: {
        width: '100%',
        padding: 20,
        backgroundColor: '#D0D0D0',
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        borderWidth: 2,
        borderColor: '#000000',
    },
    transactionListTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    transactionList: {
        flex: 1,
    },
    transactionItem: {
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f2f2f2",
        borderRadius: 8,
        marginVertical: 5,
        paddingHorizontal: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    transactionText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    transactionAmount: {
        fontSize: 16,
        color: 'gray',
    },
});
