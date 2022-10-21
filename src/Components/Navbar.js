import React from 'react';
function Navbar({setAccounts, isConnected, setIsConnected}) {
  async function connectAccount() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      setAccounts(accounts);
      setIsConnected(Boolean(accounts[0]))
    }
  }

  return(
      <div>
        {isConnected ? (
            <span>Connected</span>
        ) :
            (
                <button onClick={connectAccount}>Connect</button>
            )}
      </div>
  )
}
export default Navbar