import { Text, View, Pressable, StyleSheet, TextInput, Alert } from 'react-native'
import { useNavigation, useLocalSearchParams } from 'expo-router'
import { useState, useEffect, useContext } from 'react'
import { DbContext } from '@/contexts/DbContext'
import { AuthContext } from '@/contexts/AuthContext'
import { doc, getDoc, deleteDoc, updateDoc } from '@firebase/firestore'
import React from 'react'

export default function Detail(props: any) {
    const db = useContext(DbContext)
    const auth = useContext(AuthContext)
    const navigation = useNavigation()
    const params = useLocalSearchParams()
    const id:string  = params.id as string

    interface Idoc {
        amount: number,
        expenses: string,
        time: number,
    }
    const [document, setDocument] = useState<Idoc | any>()
    const [ modified, setModified ] = useState( false )

    useEffect(() => {
        navigation.setOptions({ headerShown: true })
        getDocument(id)
    }, [navigation])

    useEffect( () => {
        setModified( true )
    }, [document])

    const getDocument = async (documentId: string) => {
        const docRef = doc(db, `users/${auth.currentUser.uid}/expenses`, id)
        const docSnap = await getDoc(docRef)
        setDocument(docSnap.data() as Idoc)
        setModified( false )
    }


    const deleteDocument = async ( documentId: string ) => {
        const docRef = doc(db, `users/${auth.currentUser.uid}/expenses`, id)
        const delDoc = await deleteDoc( docRef )
        navigation.goBack()
    }

    const updateDocument = async () => {
        const docRef = doc(db, `users/${auth.currentUser.uid}/expenses`, id)
        const update = await updateDoc( 
            docRef, { time: document.time, expenses: document.expenses, amount: document.amount}
        )
        navigation.goBack()
    }

    const convertTimeStamp = ( timestamp:number ) => {
        const dateObj = new Date( timestamp )
        const yr = dateObj.getFullYear()
        const month = dateObj.getMonth() + 1
        const date = dateObj.getDate()
        const hour = dateObj.getHours()
        const min = dateObj.getMinutes()
        const sec = dateObj.getSeconds()
        return `${date}/${month}/${yr} ${hour}:${min}:${sec}`
    }

    if (document) {
        return (
            <View style={ styles.container }>
                <Text style={ styles.title }>Expenses</Text>
                <TextInput 
                    value={document.expenses } 
                    style={ styles.input } 
                    onChangeText={ (val) => setDocument({ time: document.time, expenses: val, amount: document.amount }) }
                />
                <Text style={ styles.title }>Amount</Text>
                <TextInput 
                    inputMode='numeric'
                    value={ document.amount.toString() } 
                    style={ styles.input } 
                    onChangeText={ (val) => setDocument( {time: document.time, expenses: document.expenses, amount: parseInt(val) } ) }
                />
                <Text>Created on: { convertTimeStamp(document.time) }</Text>
                <View style={ styles.buttonsRow }>
                    <Pressable onPress={ () => deleteDocument(id) } style={ styles.deleteButton }>
                        <Text style={ styles.buttonText }>Delete</Text>
                    </Pressable>
                    <Pressable
                        disabled={ (modified) ? false : true }
                        style={ (modified) ? styles.updateEnabled : styles.updateDisabled }
                        onPress={ () => updateDocument() }
                    >
                        <Text>Update</Text>
                    </Pressable>
                </View>
            </View>
        )
    }
    else {
        return null
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