import './App.css';
import {useState, useMemo, createContext} from 'react';
import Menu from './Menu';
import Body from './Body';
import {ThemeProvider, createTheme} from '@mui/material/styles';

const ColorModeContext = createContext({
  toggleColorMode: () => {
  },
});

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(Boolean(accounts[0]));
  const theme = createTheme({palette: 'dark',});

  return (
      <ThemeProvider theme={theme}>
        <Menu accounts={accounts} setAccounts={setAccounts}
              isConnected={isConnected}
              setIsConnected={setIsConnected}/>

        <Body accounts={accounts} isConnected={isConnected}/>
      </ThemeProvider>
  );
}
