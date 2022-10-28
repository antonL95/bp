import {useEffect, useState} from 'react';
import {BigNumber, ethers} from 'ethers';
import CreateCharacterAbi from './../CreateCharacterAbi.json';
import BasicGameItemsAbi from './../BasicGameItemsAbi.json';
import Character from './Character';
import { TextInput, Button, LoadingOverlay, ActionIcon, Alert } from '@mantine/core';
import { IconArrowRight,  } from '@tabler/icons';

const contractAddress = '0x12530448f0DDBF78A85Bdfb9387E064Cd90384aA';
const itemsContractAddress = '0x2C00F2A310ae92C4227a88B3b2AA8113784c0BfC';

function Main({accounts, isConnected}) {
  const [characterName, setCharacterName] = useState('');
  const [characterId, setCharacterId] = useState('0');
  const [chars, setChars] = useState([]);
  const [gold, setGold] = useState(0);
  const [sword, setSword] = useState(0);
  const [shield, setShield] = useState(0);
  const [apiDisabled, setApiDisabled] = useState(false);
  const [GOLD_ID, SETGOLD_ID] = useState(0);
  const [SWORD_ID, SETSWORD_ID] = useState(1);
  const [SHIELD_ID, SETSHIELD_ID] = useState(2);
  const [sellDisabled, setSellDisabled] = useState(true);
  const [loadingCreateChar, setLoadingCreateChar] = useState(false);
  const [error, setError] = useState(false);
  const [errorM, setErrorM] = useState('');
  const [errDetail, setErrDetail] = useState('');

  const getContractChar = (signer) => {
    return new ethers.Contract(
        contractAddress,
        CreateCharacterAbi.abi,
        signer,
    );
  };
  const getContractItems = (signer) => {
    return new ethers.Contract(
        itemsContractAddress,
        BasicGameItemsAbi.abi,
        signer,
    );
  };

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
            const GOLD = await contract.GOLD();
            SETGOLD_ID(parseInt(GOLD.toString()));
            const SWORD = await contract.SWORD();
            SETSWORD_ID(parseInt(SWORD.toString()));
            const SHIELD = await contract.SHIELD();
            SETSHIELD_ID(parseInt(SHIELD.toString()));
          }
        };

        const getItems = async () => {
          if (window.ethereum && isConnected) {
            await getItemIds();
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = getContractItems(signer);

            const walletAddress = ethers.utils.getAddress(accounts[0]);
            const res = await contract.balanceOfBatch(
                [walletAddress, walletAddress, walletAddress],
                [GOLD_ID, SWORD_ID, SHIELD_ID]);
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
      setLoadingCreateChar(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
          contractAddress,
          CreateCharacterAbi.abi,
          signer,
      );

      try {
        const response = await contract.createCharacter(
            BigNumber.from(characterId),
            characterName,
        );

        let txResult;
        while (typeof txResult == 'undefined') {
          txResult = await getTxReceipt(response.hash);
        }

        if (txResult.status === 1) {
          chars.push(characterName);
          setLoadingCreateChar(false);
        }
      } catch (err) {
        console.log(err);
        setError(true);
        setErrorM('character creation')
        setLoadingCreateChar(false);
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

  const getItem = async (itemId) => {
    let url;
    setApiDisabled(true);
    setError(false);
    if (itemId === GOLD_ID) {
      url = 'http://localhost:4000/aquireGold'
    }
    if (itemId === SWORD_ID) {
      url = 'http://localhost:4000/aquireSword'
    }
    if (itemId === SHIELD_ID) {
      url = 'http://localhost:4000/aquireShield'
    }
    try {

      const response = await fetch(url,
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
        if (itemId === GOLD_ID) {
          setGold(gold + 1);
        }
        if (itemId === SWORD_ID) {
          setSword(sword + 1);
        }
        if (itemId === SHIELD_ID) {
          setShield(shield + 1);
        }
        setApiDisabled(false);
      }
    } catch (err) {
      if (itemId === GOLD_ID) {
        setErrorM('getting gold');
        setError(true);
      }
      if (itemId === SWORD_ID) {
        setErrorM('getting sword');
        setError(true);
      }
      if (itemId === SHIELD_ID) {
        setErrorM('getting shield');
        setError(true);
      }
      setErrDetail(err)
      setApiDisabled(false);
    }
  }

  const sellItem = async (itemId) => {
    setSellDisabled(true);
    setError(false);
    if (window.ethereum && isConnected) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractItems(signer);

      try {
        const res = await contract.tradeObjectForGold(BigNumber.from(itemId),
            BigNumber.from(1));

        let txResult;
        while (typeof txResult == "undefined") {
          txResult = await getTxReceipt(res.hash);
        }

        if (txResult.status === 1) {
          const walletAddress = ethers.utils.getAddress(accounts[0]);
          const res = await contract.balanceOf(walletAddress, GOLD_ID);
          if (itemId === SWORD_ID) setSword(sword - 1);
          if (itemId === SHIELD_ID) setShield(shield - 1);
          setGold(parseInt(res.toString()));
          setSellDisabled(false);
        }
      } catch (err) {
        console.log(err)
        if (itemId === SWORD_ID) setErrorM('selling sword');
        if (itemId === SHIELD_ID) setErrorM('selling shield');
        setError(true);
        setSellDisabled(false);
        setErrDetail(err)
      }
    }
  };

  const handleChangeCharacterName = (event) => {
    setCharacterName(event.target.value);
  };

  const renderButtonsForContractInteraction = () => {
    if (chars.length === 0) return <></>;
    return (
        <Button.Group>
          <Button onClick={() => {getItem(GOLD_ID)}} loading={apiDisabled}>Get
            Gold ({gold})
          </Button>
          <Button onClick={() => {getItem(SWORD_ID)}}
                  loading={apiDisabled}>Get Sword ({sword})
          </Button>
          <Button onClick={() => {getItem(SHIELD_ID)}}
                  loading={apiDisabled}>Get Shield ({shield})
          </Button>
          <Button onClick={() => {sellItem(SWORD_ID)}}>Sell Sword
            ({sword}) for golds
          </Button>
          <Button onClick={() => {sellItem(SHIELD_ID)}}>Sell Shield
            ({shield}) for golds
          </Button>
        </Button.Group>
    );
  };

  return (
      <div>
        <LoadingOverlay visible={loadingCreateChar || sellDisabled} overlayBlur={2} />
        {isConnected ? (
                <div>
                  {error ? (
                      <Alert
                          withCloseButton
                          closeButtonLabel="Close alert"
                          color="red"
                          title={`Something went wrong with ${errorM}!`}
                          onClose={() => {setError(false)}}
                      >
                        {errDetail}
                  </Alert>
                  ) : <></>}

                  <TextInput
                      size="md"
                      onChange={handleChangeCharacterName}
                      rightSection={
                        <ActionIcon size={32} onClick={handleCreateCharacter}>
                          <IconArrowRight size={18} stroke={1.5} />
                        </ActionIcon>
                      }
                      placeholder="Character name"
                  />
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