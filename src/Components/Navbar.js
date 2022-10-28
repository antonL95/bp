import React from 'react';
import {
  createStyles,
  Header,
  Container,
  Button,
  Badge,
  CopyButton, Tooltip, ActionIcon, useMantineColorScheme, Group,
} from '@mantine/core';
import {IconSun, IconMoonStars, IconCopy, IconCheck } from '@tabler/icons';

const HEADER_HEIGHT = 60;

const useStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

function Navbar({accounts, setAccounts, isConnected, setIsConnected}) {
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const {classes} = useStyles();

  async function connectAccount() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccounts(accounts);
      setIsConnected(Boolean(accounts[0]));
    }
  }

  const copyButton = (
      <CopyButton value={accounts[0]} timeout={2000}>
        {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
              <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </ActionIcon>
            </Tooltip>
        )}
      </CopyButton>
  )

  return (
      <Header height={50} sx={{borderBottom: 0}} mb={120}>
        <Container className={classes.inner} fluid>
          <ActionIcon
              variant="outline"
              color={dark ? 'yellow' : 'blue'}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
          >
            {dark ? <IconSun size={18}/> : <IconMoonStars size={18}/>}
          </ActionIcon>
          {isConnected ? (
              <div style={{width: 120}}>
                <Badge variant="filled" fullWidth rightSection={copyButton}>
                  {accounts[0]}
                </Badge>

              </div>
              ) :
              (
                  <Button radius="xl" sx={{height: 30}}
                          onClick={connectAccount}>
                    Connect
                  </Button>
              )}
        </Container>
      </Header>
  );
}

export default Navbar;