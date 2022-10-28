const express = require('express');
const cors = require('cors')
const app = express();
require('dotenv').config();
const ethers = require('ethers');
const BasicItemsAbi = require('./contracts/BasicGameItemsAbi.json');
const BigNumber = ethers.BigNumber;

app.use(cors())
app.use(express.json())

app.get('/getChar', (req, res) => {
  let file = require('./characters/'+req.query.id+'.json')
  res.json(file)
})

app.post('/aquireGold', async (req, res) => {
  const address = req.body.address;
  const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_API_KEY)
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
      process.env.GAME_ITEMS_CONTRACT_ADDRESS,
      BasicItemsAbi.abi,
      signer,
  )

  const walletAddress = ethers.utils.getAddress(address);

  try {
    const response = await contract.sendGold(BigNumber.from(1), walletAddress)

    res.send({"tx": response.hash})
  } catch (err) {
    res.send({"err": err.message})
  }
})

app.post('/aquireSword', async (req, res) => {
  const address = req.body.address;
  const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_API_KEY)
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
      process.env.GAME_ITEMS_CONTRACT_ADDRESS,
      BasicItemsAbi.abi,
      signer,
  )

  const walletAddress = ethers.utils.getAddress(address);

  try {
    const response = await contract.mintSword(walletAddress)

    res.send({"tx": response.hash})
  } catch (err) {
    res.send({"err": err.message})
  }
})

app.post('/aquireShield', async (req, res) => {
  const address = req.body.address;
  const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_API_KEY)
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
      process.env.GAME_ITEMS_CONTRACT_ADDRESS,
      BasicItemsAbi.abi,
      signer,
  )

  const walletAddress = ethers.utils.getAddress(address);

  try {
    const response = await contract.mintShield(walletAddress)

    res.send({"tx": response.hash})
  } catch (err) {
    res.send({"err": err.message})
  }
})

app.post('/aquireLegendaryArmor', async (req, res) => {
  const address = req.body.address;
  const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_API_KEY)
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
      process.env.GAME_ITEMS_CONTRACT_ADDRESS,
      BasicItemsAbi.abi,
      signer,
  )

  const walletAddress = ethers.utils.getAddress(address);

  try {
    const response = await contract.mintLegendaryItem(walletAddress)

    res.send({"tx": response.hash})
  } catch (err) {
    res.send({"err": err.message})
  }
})

app.listen(4000, () => {console.log('Server started at http://localhost:4000')});