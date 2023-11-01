import * as React from 'react';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import {Home} from './app/export.js'
import { useState } from 'react';

import AppContext from './app/appContext.js';

export default function Main() {
  const [globalState, setGlobalState] = useState({});

  return (
    <AppContext.Provider value={{globalState, setGlobalState}}>
      <Home />
    </AppContext.Provider>
  );
}

AppRegistry.registerComponent(appName, () => Main);


