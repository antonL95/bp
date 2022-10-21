export default function Character({chars}) {

  const renderNames = () => {
    if (chars.length === 0) return <></>;
    return chars.map((char, i) => <p key={i}>{char}</p>)
  };

  return (
      <div>
        {renderNames()}
      </div>
  );
}