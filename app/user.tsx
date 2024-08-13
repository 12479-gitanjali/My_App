import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    FlatList,
} from 'react-native';
import { AuthContext } from '@/contexts/AuthContext';
import { DbContext } from '@/contexts/DbContext';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Goal {
    id: string;
    goal: string;
    amount: number;
}

const User: React.FC = () => {
    const auth = useContext(AuthContext);
    const db = useContext(DbContext);
    const router = useRouter();
    const [goal, setGoal] = useState<string>('');
    const [amount, setAmount] = useState<string>(''); // State for the amount
    const [goals, setGoals] = useState<Goal[]>([]); // State to hold goals

    // Fetch goals from Firestore on component mount
    React.useEffect(() => {
        const authUser = auth.currentUser.uid;
        const goalsPath = `users/${authUser}/goals`;

        const unsubscribe = onSnapshot(collection(db, goalsPath), (snapshot) => {
            const fetchedGoals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(), // Ensure this data structure matches your Firestore document structure
            })) as Goal[]; // Cast to Goal array

            setGoals(fetchedGoals); // Update goals state
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, [auth.currentUser.uid, db]);

    const handleAddGoal = async () => {
        if (goal.trim() === '' || amount.trim() === '') {
            Alert.alert('Error', 'Please enter both a goal and an amount.');
            return;
        }

        // Parse the amount to a number
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount.');
            return;
        }

        try {
            const authUser = auth.currentUser.uid;
            const goalsPath = `users/${authUser}/goals`;
            await addDoc(collection(db, goalsPath), {
                goal: goal,
                amount: parsedAmount, // Save the amount
                createdAt: new Date().toISOString(),
            });

            Alert.alert('Success', 'Goal added successfully!');
            setGoal(''); // Clear the input after successful addition
            setAmount(''); // Clear the amount input
        } catch (error) {
            console.error('Error adding goal: ', error);
            Alert.alert('Error', 'Failed to add goal. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="chevron-left" size={24} color="#4682B4" />
                </TouchableOpacity>
                <Text style={styles.header}>Add Your Goal</Text>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Enter your goal"
                value={goal}
                onChangeText={setGoal}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter the amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric" // Numeric keyboard for amount input
            />
            <TouchableOpacity onPress={handleAddGoal} style={styles.button}>
                <FontAwesome name="plus" size={20} color="#fff" />
                <Text style={styles.buttonText}>Add Goal</Text>
            </TouchableOpacity>

            {/* Title for the goals list */}
            <Text style={styles.goalsTitle}>My Goals</Text>

            {/* FlatList to display the added goals */}
            <FlatList
              data={goals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
              <TouchableOpacity 
              style={styles.goalItem}
              onPress={() => router.push({
               pathname: '/GoalDetail',
                params: { goalId: item.id } // Pass the goal ID to GoalDetail
              })}
            >
            <Text style={styles.goalText}>{item.goal}</Text>
            <Text style={styles.goalAmount}>${item.amount}</Text>
        </TouchableOpacity>
    )}
    contentContainerStyle={styles.goalsList}
    showsVerticalScrollIndicator={false}
/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        marginRight: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1, // Makes title take the remaining space
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4682B4',
        padding: 15,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    goalsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    goalsList: {
        paddingBottom: 20,
    },
    goalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    goalText: {
        fontSize: 16,
        flex: 1,
    },
    goalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4682B4',
    },
});

export default User;
