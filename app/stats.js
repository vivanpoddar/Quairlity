
import React, { useState, useEffect, useContext } from 'react';
import { ScrollView , Dimensions, StyleSheet, View} from "react-native";
import {Text, SegmentedButtons, Portal, Modal, useTheme, RadioButton, Divider} from 'react-native-paper';
import { LineChart } from "react-native-chart-kit";
import axios from 'axios';

import AppContext from './appContext';
import * as Haptics from 'expo-haptics';

const styles = StyleSheet.create({
    headingTitle: {
        padding: 10,
        fontWeight: 'bold',
    },
    lineChart: {
        paddingBottom: 10,
    }
});

const Stats = () => {
    const { globalState, setGlobalState } = useContext(AppContext);
    let server = `${globalState.selected?.ip}:${globalState.selected?.port}`;

    const [visible, setVisible] = useState(false);
    const [value, setValue] = useState('1h');
    const [promData, setData] = useState({
        co2: [0],
        pm25: [0],
        temp: [0],
        humidity: [0],
    });
    const chartConfig = {
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 0) => `rgba(255, 255, 255, ${opacity})`,
      };

    width = Dimensions.get("window").width-20;
    height = 120;
      
    const data = {
        co2: {
            datasets: [
            {
                data: promData.co2,
                color: (opacity = 100) => `rgba(255,255,255, ${opacity})`,
                strokeWidth: 2
            }
            ],
        },
        pm25: {
            datasets: [
            {
                data: promData.pm25,
                color: (opacity = 100) => `rgba(255,255,255, ${opacity})`,
                strokeWidth: 2
            }
            ],
        },
        temp: {
            datasets: [
            {
                data: promData.temp,
                color: (opacity = 100) => `rgba(255,255,255, ${opacity})`,
                strokeWidth: 2
            }
            ],
        },
        humidity: {
            datasets: [
            {
                data: promData.humidity,
                color: (opacity = 100) => `rgba(255,255,255, ${opacity})`,
                strokeWidth: 2
            }
            ],
        },
    };

    const theme = useTheme();

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);

    const apiRequest = (server, start, end, step) => {
        let newData = []
        let metrics = [0]
        console.log(step)

        axios.get(`http://${server}/api/v1/query_range?query=atmp&start=${start}&end=${end}&step=${step}`)
            .then((response) => {
                let newData = []
                metrics = response.data.data.result[0].values
                metrics.forEach(metric => {
                    newData.push(metric[1])
                })
                setData(prevState => ({
                    ...prevState,
                    temp: newData
                }));
        }).catch(() => {});

        axios.get(`http://${server}/api/v1/query_range?query=pm02&start=${start}&end=${end}&step=${step}`)
            .then((response) => {
                let newData = []
                metrics = response.data.data.result[0].values
                metrics.forEach(metric => {
                    newData.push(metric[1])
                })
                setData(prevState => ({
                    ...prevState,
                    pm25: newData
                }));
            }).catch(() => {});

        axios.get(`http://${server}/api/v1/query_range?query=rhum&start=${start}&end=${end}&step=${step}`)
            .then((response) => {
                let newData = []
                metrics = response.data.data.result[0].values
                metrics.forEach(metric => {
                    newData.push(parseInt(metric[1]))
                })
                setData(prevState => ({
                    ...prevState,
                    humidity: newData
                }));
        }).catch(() => {});

        axios.get(`http://${server}/api/v1/query_range?query=rco2&start=${start}&end=${end}&step=${step}`)
            .then((response) => {
                let newData = []
                metrics = response.data.data.result[0].values
                metrics.forEach(metric => {
                    newData.push(metric[1])
                })
                setData(prevState => ({
                    ...prevState,
                    co2: newData
                }));
        }).catch(() => {});
    }

    const update = (timePeriod) => {
        if(timePeriod=="1h") {
            let date = new Date()
            date.setHours(date.getHours() - 1)
            let start = date.toISOString();
            let end = new Date().toISOString();

            apiRequest(server, start, end, "5m")
        } else if(timePeriod=="1d") {
            let date = new Date()
            date.setDate(date.getDate() - 1)
            let start = date.toISOString();
            let end = new Date().toISOString();
            
            apiRequest(server, start, end, "1h")
        } else if(timePeriod=="1w") {
            let date = new Date()
            date.setDate(date.getDate() - 7)
            let start = date.toISOString();
            let end = new Date().toISOString();
            
            apiRequest(server, start, end, "1d")
        }
    }

    const containerStyle = {backgroundColor: theme.colors.backgroundColor, padding: 20, margin: 20};
    
    const refresh = () => {
        if(value=="1h" && server) {
            update("1h")
        } else if(value=="1d" && server) {
            update("1d")
        } else if(value=="1w" && server) {
            update("1w")
        }
    }

    return (
        <ScrollView>
            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
                    <RadioButton.Group onValueChange={value => setValue(value)} value={value}>
                        <RadioButton.Item label="1h" value="1h" />
                        <RadioButton.Item label="1d" value="1d" />
                        <RadioButton.Item label="1w" value="1w" />
                    </RadioButton.Group>
                </Modal>
            </Portal>

            <View style={[{flexDirection: "row"}]}>
                <SegmentedButtons
                    style={{alignSelf: 'flex-end', flex:1, margin: 10}}
                    theme={{roundness:2}}
                    value=""
                    onValueChange={(value) => {}}
                    buttons={[
                    {
                        value: 'Time',
                        label: 'Time Period',
                        onPress: () => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            console.log(globalState)
                            showModal()
                        }
                    },
                    {
                        value: 'Refresh',
                        label: 'Refresh',
                        onPress: () => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                            refresh();
                        }
                    }
                    ]}
                />
            </View>
            
            <Text>Temperature</Text>
            <Divider/>
            <LineChart
                data={data.temp}
                width={width}
                height={height}
                chartConfig={chartConfig}
                bezier
                style={styles.lineChart}
            />
            <Text>Humidity</Text>
            <Divider/>
            <LineChart
                data={data.humidity}
                width={width}
                height={height}
                chartConfig={chartConfig}
                bezier
                style={styles.lineChart}
            />
            <Text>CO2 Concentration</Text>
            <Divider/>
            <LineChart
                data={data.co2}
                width={width}
                height={height}
                chartConfig={chartConfig}
                bezier
                style={styles.lineChart}
            />
            <Text>PM2.5 Concentration</Text>
            <Divider/>
            <LineChart
                data={data.pm25}
                width={width}
                height={height}
                chartConfig={chartConfig}
                bezier
                style={styles.lineChart}
            />
        </ScrollView>
    )
}

export default Stats;