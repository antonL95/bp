import {
  AppBar,
  Box,
  Button,
  Container, Toolbar, Typography,
} from '@mui/material';

function Menu({accounts, setAccounts, isConnected, setIsConnected}) {

  async function connectAccount() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccounts(accounts);
      setIsConnected(Boolean(accounts[0]));
    }
  }

  return (
      <Box sx={{flexGrow: 1}}>
        <AppBar position="static">
          <Container>
            <Toolbar>
              <Typography variant="h6" noWrap component="div"
                          sx={{flexGrow: 1}}>
              </Typography>
              <div>
                {isConnected ? (
                        <Typography>
                          {accounts[0]}
                        </Typography>
                    ) :
                    (
                        <Button variant="contained"
                                onClick={connectAccount}>
                          Connect
                        </Button>
                    )}
              </div>
            </Toolbar>
          </Container>
        </AppBar>
      </Box>
  );
}

export default Menu;
