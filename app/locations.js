import { useState, useContext, useEffect, useRef } from 'react';
import AppContext from './appContext';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {ScrollView, View, StyleSheet,  AppState } from 'react-native';
import { Text, SegmentedButtons, Button, Divider, Modal, Portal, useTheme, TextInput } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const styles = StyleSheet.create({
  margin: {
    paddingLeft: 10,
  },
  dividerTop: {
    marginBottom: 10,
  },
  dividerBottom: {
    marginTop: 10,
  },
  text: {
    fontSize: 20,
  }
});

const Locations = () => {
  const { globalState, setGlobalState } = useContext(AppContext);

  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [temp, setTemp] = useState('');
  const [status, setStatus] = useState('');
  const [serverIP, setServerIP] = useState('');
  const [port, setPort] = useState('');

  const theme = useTheme();

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = {backgroundColor: theme.colors.secondaryContainer, padding: 20, margin: 20};

  const [locations, setLocations] = useState([])

  const addLocation = () => {
    newLocation = {
      ID: text,
      name: "Sensor " + text,
      temp: temp,
      notes: note,
      status: status,
      ip: serverIP,
      port: port
    }
    setLocations([...locations, newLocation])
  }

  useEffect(() => {
    const loadLocations = async () => {
      try {
        await AsyncStorage.setItem('locations', JSON.stringify(locations))
      } catch (e) {
        console.log(e)
      }
    }

    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if(nextAppState === 'inactive') {
        loadLocations()
      }
    })

    return () => {
      appStateSubscription.remove();
    };
  })

  useEffect(() => {
    const retrieveLocations = async () => {
      try {
          let jsonValue = await AsyncStorage.getItem('locations')
          setLocations(jsonValue != null ? JSON.parse(jsonValue) : [])
        } catch (e) {
          console.log(e)
        }
    }

    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if(nextAppState === 'active') {
        retrieveLocations()
      }
    })

    return () => {
      appStateSubscription.remove();
    };
  })

  const selectButton = (location) => {
    setGlobalState({selected: location, sensorData: globalState.sensorData})
  }
  
  const Sensors = () => {
    return locations.map((location, index) => (
      <View key={index}>
        <View style={styles.divider}>
          <Divider style={styles.dividerTop} />
          <Text variant="displaySmall" style={styles.margin}>Sensor {location.ID}</Text>
          <View style={{flexDirection:'row'}}>
            <Text style={[styles.margin, styles.text]}>Status - </Text>
            <Icon
              name="circle"
              size={20}
              color={location?.status || "yellow"}
            ></Icon>
            <Text style={[styles.margin, styles.text]}> from {location.ip}:{location.port}</Text>
          </View>
          <Text style={[styles.margin, {fontSize:15}]}>{location.notes}</Text>
          
          <View style={{flexDirection:'row', alignSelf:'flex-end'}}>
          <Button
              style={{marginTop:10, marginRight:10, borderRadius: 10}}
              mode="outlined"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                locations.splice(index, 1)
                setLocations([...locations])
              }
            }
            >Remove</Button>
            <Button
              style={{alignSelf:'flex-end', marginTop:10, marginRight:10, borderRadius: 10}}
              mode="outlined"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                selectButton(location)
              }
            }
            >Select</Button>
          </View>
          <Divider style={styles.dividerBottom}/>
        </View>
      </View>
    ));
  };


  function refresh() {
    console.log(globalState)
    locations.forEach((location) => {
      if (location.status == '') {
        let server = location.ip + ":" + location.port;
        axios.get(`http://${server}/api/v1/query?query=atmp`)
        .then((response) => {
          location.status = 'green'
          setLocations([...locations])
        })
        .catch(() => {
          location.status = 'red'
          setLocations([...locations])
        });
      }
    })
  }

  return (
    <ScrollView>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
          <Text style={styles.text}>Add Location</Text>
          <TextInput
            mode='outlined'
            label="Sensor ID"
            value={text}
            onChangeText={text => {if(text.length<4) setText(text)}}
          />
          <TextInput
            mode='outlined'
            label="Temperature Reading F/C"
            value={temp}
            onChangeText={temp => setTemp(temp)}
          />
          <TextInput
            mode='outlined'
            label="Notes"
            value={note}
            onChangeText={note => setNote(note)}
          />
          <TextInput
            mode='outlined'
            label="Prometheus Server IP"
            value={serverIP}
            onChangeText={serverIP => setServerIP(serverIP)}
          />
          <TextInput
            mode='outlined'
            label="Port (Prometheus Default 9090)"
            value={port}
            onChangeText={port => setPort(port)}
          />
          <Button 
            style={{marginTop:10, borderRadius: 10}}
            mode='outlined'
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              addLocation()
              hideModal()
              }
            }
          >Submit</Button>
        </Modal>
      </Portal>
      <SegmentedButtons
        style={{margin:10}}
        theme={{roundness:2}}
        value=""
        onValueChange={(value) => {}}
        buttons={[
          {
            value: 'Add Location',
            label: 'Add Location',
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
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
      <Sensors/>
    </ScrollView>
  );
}

export default Locations;