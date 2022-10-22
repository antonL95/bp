import {useEffect, useState} from 'react';
import {BigNumber, ethers} from 'ethers';
import CreateCharacterAbi from './../CreateCharacterAbi.json';
import BasicGameItemsAbi from './../BasicGameItemsAbi.json';
import Character from './Character';

const contractAddress = '0x12530448f0DDBF78A85Bdfb9387E064Cd90384aA';
const itemsContractAddress = '0x2C00F2A310ae92C4227a88B3b2AA8113784c0BfC';

function Main({accounts, isConnected}) {
  const [characterName, setCharacterName] = useState('');
  const [characterId, setCharacterId] = useState('0');
  const [chars, setChars] = useState([]);
  const [gold, setGold] = useState(0);
  const [sword, setSword] = useState(0);
  const [shield, setShield] = useState(0);
  const [goldDisabled, setGoldDisabled] = useState(false);
  const [swordDisabled, setSwordDisabled] = useState(false);
  const [shieldDisabled, setShieldDisabled] = useState(false);
  const [GOLD_ID, SETGOLD_ID] = useState(0);
  const [SWORD_ID, SETSWORD_ID] = useState(0);
  const [SHIELD_ID, SETSHIELD_ID] = useState(0);
  const [sellDisabled, setSellDisabled] = useState(true);

  const getContractChar = (signer) => {
    return new ethers.Contract(
        contractAddress,
        CreateCharacterAbi.abi,
        signer,
    );
  }
  const getContractItems = (signer) => {
    return new ethers.Contract(
        itemsContractAddress,
        BasicGameItemsAbi.abi,
        signer,
    );
  }

  useEffect(
      () => {
        const getChars = () => {
          if (window.ethereum && isConnected) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const walletAddress = ethers.utils.getAddress(accounts[0]);
            getContractChar(signer).charactersOwnedByAddress(walletAddress)
                .then(res => setChars(res));
          }
        };

        const getItemIds = async () => {
          if (window.ethereum && isConnected) {
            const provider = new ethers.providers.Web3Provider(
                window.ethereum);
            const signer = provider.getSigner();
            const contract = getContractItems(signer);
            const GOLD = await contract.GOLD()
            SETGOLD_ID(parseInt(GOLD.toString()))
            const SWORD = await contract.SWORD()
            SETSWORD_ID(parseInt(SWORD.toString()))
            const SHIELD = await contract.SHIELD()
            SETSHIELD_ID(parseInt(SHIELD.toString()))
          }
        }

        const getItems = async () => {
          if (window.ethereum && isConnected) {
            await getItemIds();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = getContractItems(signer);

            const walletAddress = ethers.utils.getAddress(accounts[0]);
            const res = await contract.balanceOfBatch([walletAddress,walletAddress,walletAddress], [GOLD_ID,SWORD_ID,SHIELD_ID]);
            setGold(parseInt(res[0].toString()));
            setSword(parseInt(res[1].toString()));
            setShield(parseInt(res[2].toString()));
          }
        };
        getChars();
        getItems();
        setSellDisabled(false);
      },
      [isConnected],
  );

  useEffect(
      () => {
        if (characterName.length === 0) return;
        const convertStringToId = () => {
          let output = '';
          for (let i = 0; i < characterName.length; i++) {
            output += characterName[i].charCodeAt(0).toString(10);
          }

          return output.toString();
        };
        setCharacterId(convertStringToId());
      },
      [characterName],
  );

  async function handleCreateCharacter() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
          contractAddress,
          CreateCharacterAbi.abi,
          signer,
      );

      try {
        await contract.createCharacter(
            BigNumber.from(characterId),
            characterName,
        );
      } catch (err) {
        console.log(err);
      }
    }
  }

  const getTxReceipt = async (txHash) => {
    if (window.ethereum && isConnected) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const txReceipt = await provider.getTransactionReceipt(txHash);

      if (txReceipt && txReceipt.blockNumber) {
        return txReceipt;
      }
    }
  };

  const getGold = async () => {
    setGoldDisabled(true);
    const response = await fetch('http://localhost:4000/aquireGold',
        {
          method: 'POST',
          body: JSON.stringify({'address': accounts[0]}),
          headers: {
            'Content-Type': 'application/json',
          },
        });
    const json = await response.json();

    let txResult;
    while (typeof txResult == "undefined") {
      txResult = await getTxReceipt(json.tx);
    }
    if (txResult.status === 1) {
      setGold(gold+1);
      setGoldDisabled(false);
    }
  };

  const getSword = async () => {
    setSwordDisabled(true);
    const response = await fetch('http://localhost:4000/aquireSword',
        {
          method: 'POST',
          body: JSON.stringify({'address': accounts[0]}),
          headers: {
            'Content-Type': 'application/json',
          },
        });
    const json = await response.json();

    let txResult;
    while (typeof txResult == "undefined") {
      txResult = await getTxReceipt(json.tx);
    }
    if (txResult.status === 1) {
      setSword(sword+1);
      setSwordDisabled(false);
    }
  };

  const getShield = async () => {
    setShieldDisabled(true);
    const response = await fetch('http://localhost:4000/aquireShield',
        {
          method: 'POST',
          body: JSON.stringify({'address': accounts[0]}),
          headers: {
            'Content-Type': 'application/json',
          },
        });
    const json = await response.json();

    let txResult;
    while (typeof txResult == "undefined") {
      txResult = await getTxReceipt(json.tx);
    }
    if (txResult.status === 1) {
      setShield(shield+1);
      setShieldDisabled(false);
    }
  };

  const sellItem = async (itemId) => {
    setSellDisabled(true);
    if (window.ethereum && isConnected) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractItems(signer);

      const res = await contract.tradeObjectForGold(BigNumber.from(itemId),
          BigNumber.from(1));

      let txResult;
      while (typeof txResult == "undefined") {
        txResult = await getTxReceipt(res.hash);
      }

      if (txResult.status === 1) {
        const walletAddress = ethers.utils.getAddress(accounts[0]);
        const res = await contract.balanceOf(walletAddress, GOLD_ID);
        if(itemId === SWORD_ID) setSword(sword - 1);
        if(itemId === SHIELD_ID) setShield(shield - 1);
        setGold(parseInt(res.toString()))
        setSellDisabled(false);
      }
    }
  };

  const sellSword = () => {
    sellItem(SWORD_ID);
  }

  const sellShield = () => {
    sellItem(SHIELD_ID);
  }

  const handleChangeCharacterName = (event) => {
    setCharacterName(event.target.value);
  };

  const renderButtonsForContractInteraction = () => {
    if (chars.length === 0) return <></>;
    return (
        <div>
          <button onClick={getGold} disabled={goldDisabled || sellDisabled}>Get Gold ({gold})</button>
          <button onClick={getSword} disabled={swordDisabled || sellDisabled}>Get Sword ({sword})</button>
          <button onClick={getShield} disabled={shieldDisabled || sellDisabled}>Get Shield ({shield})</button>
          <button onClick={sellSword} disabled={sellDisabled}>Sell Sword ({sword}) for golds</button>
          <button onClick={sellShield} disabled={sellDisabled}>Sell Shield ({shield}) for golds</button>
        </div>
    );
  };

  return (
      <div>
        {isConnected ? (
                <div>
                  <input type={'text'} onChange={handleChangeCharacterName}
                         maxLength={50}/>
                  <button onClick={handleCreateCharacter}>Create character</button>
                  <Character chars={chars}/>
                  {renderButtonsForContractInteraction()}
                </div>
            )
            : <div>Connect wallet</div>
        }
      </div>
  );
}

export default Main;