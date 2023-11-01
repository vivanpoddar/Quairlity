import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import { PaperProvider, Appbar, MD3DarkTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

import Welcome from './welcome.js'
import QuairlityAI from './quairlityai.js'
import Locations from './locations.js' 
import Stats from './stats.js';

const Tab = createMaterialBottomTabNavigator();

const theme = {
  ...MD3DarkTheme,
  fonts: {
    ...MD3DarkTheme.fonts,
    regular: {
      fontFamily: 'OpenSans-Regular',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'OpenSans-SemiBold',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'OpenSans-Light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'OpenSans-Light',
      fontWeight: 'normal',
    },
  },
};

const Home = () => {
  const [title, setTitle] = useState("Home");

  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.Content title={title} />
      </Appbar.Header>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="Home"
            component={Welcome}
            listeners={{tabPress: e => {
              setTitle("Home")
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }}
            }
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="air-filter" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen
            name="Stats"
            component={Stats}
            listeners={{tabPress: e => {
              setTitle("Statistics")
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }}
            }
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="chart-line" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen
            name="Quairlity AI"
            component={QuairlityAI}
            listeners={{tabPress: e => {
              setTitle("Quairlity AI")
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }
            }}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="message" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen
            name="Connections"
            component={Locations}
            listeners={{tabPress: e => {
              setTitle("Connections")
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }
            }}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="wifi" color={color} size={26} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default Home;