import './App.css';
import {useState} from 'react';
import Navbar from './Components/Navbar';
import Main from './Components/Main';
import {MantineProvider, ColorSchemeProvider, Container} from '@mantine/core';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(Boolean(accounts[0]));
  const [colorScheme, setColorScheme] = useState('dark');
  const toggleColorScheme = (value) =>
      setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
      <ColorSchemeProvider colorScheme={colorScheme}
                           toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{
          colorScheme,
          fontFamily: 'Verdana, sans-serif',
          fontFamilyMonospace: 'Monaco, Courier, monospace',
          headings: {fontFamily: 'Greycliff CF, sans-serif'},
        }} withGlobalStyles
                         withNormalizeCSS>
          <Navbar accounts={accounts} setAccounts={setAccounts} isConnected={isConnected}
                  setIsConnected={setIsConnected}/>
          <Container>
            <Main accounts={accounts} isConnected={isConnected}/>
          </Container>
        </MantineProvider>
      </ColorSchemeProvider>
  );
}

export default App;
