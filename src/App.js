import './App.css';
import {useState} from 'react';
import Navbar from './Components/Navbar';
import Main from './Components/Main';

function App() {
  const [accounts, setAccounts] = useState([]);
  const [isConnected, setIsConnected] = useState(Boolean(accounts[0]));

  return (
    <div className="App">
      <Navbar setAccounts={setAccounts} isConnected={isConnected} setIsConnected={setIsConnected}/>
      <Main accounts={accounts} isConnected={isConnected}/>
    </div>
  );
}

export default App;
