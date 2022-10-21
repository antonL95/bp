import {useEffect, useState} from 'react';
import {BigNumber, ethers} from 'ethers';
import CreateCharacterAbi from './../CreateCharacterAbi.json';
import Character from './Character';
const contractAddress = '0x12530448f0DDBF78A85Bdfb9387E064Cd90384aA';

function Main({accounts, isConnected}) {
  const [characterName, setCharacterName] = useState('');
  const [characterId, setCharacterId] = useState('0');
  const [chars, setChars] = useState([]);

  useEffect(
      () => {
        const getChars = () => {
          if (window.ethereum && isConnected) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                contractAddress,
                CreateCharacterAbi.abi,
                signer,
            );

            const walletAddress = ethers.utils.getAddress(accounts[0]);
            contract.charactersOwnedByAddress(walletAddress)
                .then(res => setChars(res));
          }
        }
        getChars()
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
        console.log(err)
      }
    }
  }

  const getGold = async () => {
    await fetch('http://localhost:4000/aquireGold',
        {
          method: "POST",
          body: JSON.stringify({"address": accounts[0]}),
          headers: {
            'Content-Type': 'application/json'
          },
        })
  }

  const getSword = async () => {
    await fetch('http://localhost:4000/aquireSword',
        {
          method: "POST",
          body: JSON.stringify({"address": accounts[0]}),
          headers: {
            'Content-Type': 'application/json'
          },
        })
  }

  const getShield = async () => {
    await fetch('http://localhost:4000/aquireShield',
        {
          method: "POST",
          body: JSON.stringify({"address": accounts[0]}),
          headers: {
            'Content-Type': 'application/json'
          },
        })
  }

  const handleChangeCharacterName = (event) => {
    setCharacterName(event.target.value);
  };

  const renderButtonsForContractInteraction = () => {
    if (chars.length === 0) return <></>;
    return (
        <div>
          <button onClick={getGold}>Get Gold</button>
          <button onClick={getSword}>Get Sword</button>
          <button onClick={getShield}>Get Shield</button>
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