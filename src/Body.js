import {useEffect, useState} from 'react';
import {BigNumber, ethers} from 'ethers';
import CreateCharacterAbi from './CreateCharacterAbi.json';
import BasicGameItemsAbi from './BasicGameItemsAbi.json';
import Character from './Character';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Backdrop, Box,
  ButtonGroup,
  CircularProgress,
  Collapse,
  Container,
  IconButton,
  InputBase,
  Paper,
} from '@mui/material';

const contractAddress = '0x3eEec5Dcc66a2D071BCefA7723A76c993302523e';
const itemsContractAddress = '0x6791C46964D64f31b4bB42ffcF0785ff45E0cf68';

function Body({accounts, isConnected}) {
  const [characterName, setCharacterName] = useState('');
  const [characterId, setCharacterId] = useState('0');
  const [chars, setChars] = useState([]);
  const [gold, setGold] = useState(0);
  const [sword, setSword] = useState(0);
  const [shield, setShield] = useState(0);
  const [legendaryArmor, setLegendaryArmor] = useState(0);
  const [apiDisabled, setApiDisabled] = useState(false);
  const [GOLD_ID, SETGOLD_ID] = useState(0);
  const [SWORD_ID, SETSWORD_ID] = useState(1);
  const [SHIELD_ID, SETSHIELD_ID] = useState(2);
  const [LEGENDARY_ID, SETLEGENDARY_ID] = useState(999);
  const [sellDisabled, setSellDisabled] = useState(true);
  const [loadingCreateChar, setLoadingCreateChar] = useState(false);
  const [error, setError] = useState(false);
  const [errorM, setErrorM] = useState('');
  const [errDetail, setErrDetail] = useState('');
  const [open, setOpen] = useState(false);

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
            const LEGENDARY_ARMOR = await contract.LEGENDARY_ARMOR();
            SETLEGENDARY_ID(parseInt(LEGENDARY_ARMOR.toString()));
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
                [walletAddress, walletAddress, walletAddress, walletAddress],
                [GOLD_ID, SWORD_ID, SHIELD_ID, LEGENDARY_ID]);
            setGold(parseInt(res[0].toString()));
            setSword(parseInt(res[1].toString()));
            setShield(parseInt(res[2].toString()));
            setLegendaryArmor(parseInt(res[3].toString()));
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
        setErrorM('character creation');
        setOpen(true);
        setErrDetail(err.message);
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
      url = 'http://localhost:4000/aquireGold';
    }
    if (itemId === SWORD_ID) {
      url = 'http://localhost:4000/aquireSword';
    }
    if (itemId === SHIELD_ID) {
      url = 'http://localhost:4000/aquireShield';
    }
    if (itemId === LEGENDARY_ID) {
      url = 'http://localhost:4000/aquireLegendaryArmor';
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
      if (json.err) {
        setError(true);
        setErrDetail(json.err);
        setApiDisabled(false);
        return;
      }

      let txResult;
      while (typeof txResult == 'undefined') {
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
        if (itemId === LEGENDARY_ID) {
          setLegendaryArmor(1);
        }
        setApiDisabled(false);
      }
    } catch (err) {
      if (itemId === GOLD_ID) {
        setErrorM('getting gold');
        setOpen(true);
        setError(true);
      }
      if (itemId === SWORD_ID) {
        setErrorM('getting sword');
        setOpen(true);
        setError(true);
      }
      if (itemId === SHIELD_ID) {
        setErrorM('getting shield');
        setOpen(true);
        setError(true);
      }
      if (itemId === LEGENDARY_ID) {
        setErrorM('getting legendary armor');
        setOpen(true);
        setError(true);
      }
      setErrDetail(err.message);
      setApiDisabled(false);
    }
  };

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
        while (typeof txResult == 'undefined') {
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
        if (itemId === SWORD_ID) {
          setErrorM('selling sword');
          setOpen(true);
        }
        if (itemId === SHIELD_ID) {
          setErrorM('selling shield');
          setOpen(true);
        }
        setError(true);
        setSellDisabled(false);
        setErrDetail(err.message);
      }
    }
  };

  const handleChangeCharacterName = (event) => {
    setCharacterName(event.target.value);
  };

  const renderButtonsForContractInteraction = () => {
    if (chars.length === 0) return <></>;
    return (
        <ButtonGroup>
          <LoadingButton
              onClick={() => {
                getItem(GOLD_ID);
              }}
              size="small"
              color="secondary"
              variant="contained"
              loading={apiDisabled}>Get
            Gold ({gold})
          </LoadingButton>
          <LoadingButton
              onClick={() => {
                getItem(SWORD_ID);
              }}
              size="small"
              color="secondary"
              variant="contained"
              loading={apiDisabled}>Get Sword ({sword})
          </LoadingButton>
          <LoadingButton
              onClick={() => {
                getItem(SHIELD_ID);
              }}
              size="small"
              color="secondary"
              variant="contained"
              loading={apiDisabled}>Get Shield ({shield})
          </LoadingButton>
          <LoadingButton
              onClick={() => {
                getItem(LEGENDARY_ID);
              }}
              size="small"
              color="secondary"
              variant="contained"
              loading={apiDisabled}>Get Legendary armor
            ({legendaryArmor})
          </LoadingButton>
          <LoadingButton
              onClick={() => {
                sellItem(SWORD_ID);
              }} disabled={sword === 0}

              size="small"
              color="secondary"
              variant="contained"
              loading={apiDisabled}>Sell Sword
            ({sword}) for golds
          </LoadingButton>
          <LoadingButton
              onClick={() => {
                sellItem(SHIELD_ID);
              }}
              disabled={shield === 0}

              size="small"
              color="secondary"
              variant="contained"
              loading={apiDisabled}>Sell Shield
            ({shield}) for golds
          </LoadingButton>
        </ButtonGroup>
    );
  };

  return (
      <Box mt={5}>
        <Container>
          <Backdrop
              sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
              open={loadingCreateChar || sellDisabled}
          >
            <CircularProgress color="inherit"/>
          </Backdrop>
          {isConnected ? (
                  <div>
                    {error ? (
                        <Collapse in={error}>
                          <Alert
                              severity="error"
                              title={`Something went wrong with ${errorM}!`}
                              action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => {
                                      setError(false);
                                    }}
                                >
                                  <CloseIcon fontSize="inherit"/>
                                </IconButton>
                              }
                              sx={{mb: 2}}
                          >
                            {errDetail}
                          </Alert>
                        </Collapse>
                    ) : <></>}

                    <Paper
                        component="form"
                        sx={{
                          p: '2px 4px',
                          display: 'flex',
                          alignItems: 'center',
                          width: 400,
                        }}
                    >
                      <InputBase
                          sx={{ml: 1, flex: 1}}
                          placeholder="Character name"
                          inputProps={{'aria-label': 'search google maps'}}
                          onChange={handleChangeCharacterName}
                          variant="outlined"
                      />
                      <IconButton
                          type="button"
                          sx={{p: '10px'}}
                          onClick={handleCreateCharacter}>
                        <SendIcon/>
                      </IconButton>
                    </Paper>
                    <Character chars={chars}/>
                    {renderButtonsForContractInteraction()}
                  </div>
              )
              : <div>Connect wallet</div>
          }
        </Container>
      </Box>
  );
}

export default Body;
