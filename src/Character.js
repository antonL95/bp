import {Box, Typography} from '@mui/material';

export default function Character({chars}) {

  const renderNames = () => {
    if (chars.length === 0) return <></>;
    return chars.map((char, i) => <Typography key={i}>{char}</Typography>);
  };

  return (
      <Box p={2}>
        {renderNames()}
      </Box>
  );
}
