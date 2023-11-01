import {Keyboard} from 'react-native';
import { IconButton } from 'react-native-paper';
import React, {useState, useCallback, useEffect, useContext} from 'react';
import {GiftedChat} from 'react-native-gifted-chat';
import axios from 'axios';
import * as Haptics from 'expo-haptics';

import AppContext from './appContext';

const apiKey = process.env.EXPO_PUBLIC_APIKEY
const api = process.env.EXPO_PUBLIC_API
const hostKey = process.env.EXPO_PUBLIC_HOSTNAME_KEY
const host = process.env.EXPO_PUBLIC_HOSTNAME

const QuairlityAI = () => {
    const { globalState, setGlobalState } = useContext(AppContext);

    const [messages, setMessages] = useState([])
    const [placeholder, setPlaceholder] = useState("Send a message");

    useEffect(() => {
      setMessages([
        {
          _id: 1,
          text: "Hey there! I'm Quairlity AI. I can access your air quality sensor data and can provide answers to any questions you may have about improving your indoor air quality standards. What would you like to know?",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Quairlity AI',
            avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/05/HONDA_ASIMO.jpg',
          },
        },
      ])
    }, [])
  
    const onSend = useCallback((messages = []) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, messages),
      )

      const options = {
        method: 'POST',
        url: `https://${host}/v1/chat/completions`,
        headers: {
          'content-type': 'application/json',
          api: apiKey,
          hostKey: host
        },
        data: {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `System message: You are an AI chatbot called Quairlity AI that can answer questions about indoor air quality. Answer questions without quotes. 
              Here are the current metrics and readings. You have access to the real-time data. PM2.5: ${globalState?.pm25 || "No data"} CO2: ${globalState?.rco2 || "No data"} Temperature: ${globalState?.atmp || "No data"} Humidity: ${globalState?.rhum|| "No data"}. If there is no data, ask the user if they have added their sensor.`
            },
            {
              role: 'user',
              content: messages[0].text
            }
          ]
        }
      };

      const fetchData = async () => {
        try {
          setPlaceholder("Quairlity AI is typing...");
          const response = await axios.request(options);
          message = {
            _id: Math.round(Math.random() * 1000000),
            text: response.data.choices[0].message.content,
            createdAt: new Date(),
            user: {
              _id: 2,
              name: 'Quairlity AI',
              avatar: './assets/robot.png',
            },
          }
          setMessages(previousMessages =>
            GiftedChat.append(previousMessages, message),
          )
          setPlaceholder("Send a message");
        } catch (error) {
          console.error(error);
        }
      }

      fetchData();
    }, [])

    return (
        <GiftedChat
          renderActions={() => 
              <IconButton
                  icon="close-box-outline"
                  onPress={() => Keyboard.dismiss()}
                  style={{flex:0}}
              />
          }
          bottomOffset={106}
          alwaysShowSend={true}
          placeholder={placeholder}
          isTyping={true}
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: 1,
          }}
        />
    )
}

export default QuairlityAI;