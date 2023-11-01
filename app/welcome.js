import {ScrollView, View} from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import { StyleSheet, Dimensions } from 'react-native';
import axios from 'axios';

import React, { useState, useEffect, useContext  } from 'react';
import AppContext from './appContext';
import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
    card: {
        marginTop: 10,
        flex: 1,
    },
    cardTitle: {
        paddingBottom: 10,
    },
    cardInformation: {
        paddingTop: 10,
        textAlign: "center",
        fontSize: 50,
    },
    title: {
        paddingBottom: 10,
    },
    headingTitle: {
        paddingTop: 10,
        fontWeight: 'bold',
    },
    smallMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
    }
});



const Welcome = () => {
    const { globalState, setGlobalState } = useContext(AppContext);

    const [atmp, setAtmp] = useState(0);
    const [rco2, setRco2] = useState(0);
    const [rhum, setRhum] = useState(0);
    const [pm25, setPm25] = useState(0);

    const [userName, setUserName] = useState("Vivan");

    const update = () => {
        let server = globalState.selected?.ip + ":" + globalState.selected?.port;
        axios.get(`http://${server}/api/v1/query?query=atmp`)
            .then((response) => {
                setAtmp(response.data.data.result[0].value[1])
            })
            .catch(() => {});

        axios.get(`http://${server}/api/v1/query?query=rhum`)
            .then((response) => {
                setRhum(response.data.data.result[0].value[1])
            })
            .catch(() => {});
    
        axios.get(`http://${server}/api/v1/query?query=rco2`)
            .then((response) => {
                setRco2(response.data.data.result[0].value[1])
            })
            .catch(() => {});
    
        axios.get(`http://${server}/api/v1/query?query=pm02`)
            .then((response) => {
                setPm25(response.data.data.result[0].value[1])
            })
            .catch(() => {})
    }

    update();

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Updating...")
            update()
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let sensorData = {atmp: atmp, rco2: rco2, rhum: rhum, pm25: pm25}
        console.log(sensorData)

        setGlobalState(prevState => ({ 
            ...prevState,
            ...sensorData
        }));
        console.log(globalState)
    }, [atmp, rco2, rhum, pm25])
      
    return (
        <View style={{margin:10, flex: 1}}>
            <Text variant="displaySmall" style={styles.title}>Welcome, {userName}</Text>
            <Divider/>
            <ScrollView>
                <Text variant="headlineSmall" style={styles.headingTitle}>Metrics</Text>
                <View style={styles.smallMetrics}>
                    <Card style={[styles.card, {marginRight: 10}]}>
                        <Card.Content>
                        <Text variant="titleLarge" style={styles.cardTitle}>Temperature</Text>
                        <Divider/>
                        <Text style={[styles.cardInformation, (atmp > 35 ? {color: 'red'} : atmp >= 30 ? {color: 'yellow'} : {color:'white'})]}>{Math.round(globalState.selected?.temp === 'F' ? atmp * 9/5 + 32 : atmp)}°{globalState.selected?.temp || "C"}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={styles.card}>
                        <Card.Content>
                        <Text variant="titleLarge" style={styles.cardTitle}>Humidity</Text>
                        <Divider/>
                        <Text style={[styles.cardInformation, (rhum > 70 ? {color: 'red'} : rhum >= 60 ? {color: 'yellow'} : {color:'white'})]}>{rhum}%</Text>
                        </Card.Content>
                    </Card>
                </View>
                <Card style={styles.card}>
                    <Card.Content>
                    <Text variant="titleLarge" style={styles.cardTitle}>PM 2.5 Concentration</Text>
                    <Divider/>
                    <Text style={[styles.cardInformation, (pm25 > 36 ? {color: 'red'} : pm25 >= 12 ? {color: 'yellow'} : {color:'white'})]}>{pm25}µg/m³</Text>
                    </Card.Content>
                </Card>

                <Card style={[styles.card]}>
                    <Card.Content>
                        <Text variant="titleLarge" style={styles.cardTitle}>CO2 Concentration</Text>
                        <Divider/>
                        <Text style={[styles.cardInformation, (rco2 > 1200 ? {color: 'red'} : rco2 >= 1000 ? {color: 'yellow'} : {color:'white'})]}>{rco2}ppm</Text>
                    </Card.Content>
                </Card>
                <Text variant="headlineSmall" style={styles.headingTitle}>Sensor Information</Text>

                <View style={styles.smallMetrics}>
                    <Card style={[styles.card, {marginRight: 10, height: 130}]}>
                        <Card.Content>
                            <Text variant="titleLarge" style={styles.cardTitle}>ID</Text>
                            <Divider/>
                            <Text style={[styles.cardInformation]}>{globalState.selected?.ID || "N/A"}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.card, {marginRight: 10, height: 130}]}>
                        <Card.Content>
                            <Text variant="titleLarge" style={[styles.cardTitle]}>Status</Text>
                            <Divider/>
                            <Icon
                                style={styles.cardInformation}
                                name={globalState.selected?.status === 'red' ? 'exclamation' : globalState.selected?.status === 'green' ? 'check' : 'minus'}
                                color={globalState.selected?.status || "yellow"}
                            />
                        </Card.Content>
                    </Card>
                    <Card style={[styles.card, {height: 130}]}>
                        <Card.Content>
                            <Text variant="titleLarge" style={styles.cardTitle}>Unit</Text>
                            <Divider/>
                            <Text style={styles.cardInformation}>{globalState.selected?.temp || "N/A"}</Text>
                        </Card.Content>
                    </Card>
                </View>
                    <Card style={styles.card}>
                        <Card.Content>
                        <Text variant="titleLarge" style={styles.cardTitle}>Notes Information</Text>
                        <Divider/>
                        <Text style={{paddingTop: 10}}>{globalState.selected?.notes || "N/A"}</Text>
                        </Card.Content>
                    </Card>
            </ScrollView>
        </View>
    );
}

export default Welcome;