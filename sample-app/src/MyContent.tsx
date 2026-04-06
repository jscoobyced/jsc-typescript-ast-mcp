export const MyContent = ({ contentText, includeButton = false }) => {
  const contentElement = (
    <p
      style={{
        fontSize: "1em",
        margin: "0.5em 0",
      }}
    >
      {contentText.map((text, index) => (
        <span
          key={`content-${String(index)}`}
          my-data-id={`content-${String(index)}`}
        >
          {text}
        </span>
      ))}
    </p>
  );

  return (
    <div>
      {contentElement}
      {includeButton && (
        <button
          style={{
            marginTop: "1em",
            padding: "0.5em 1em",
            fontSize: "1em",
            cursor: "pointer",
          }}
          onClick={() => void 0}
        >
          Click Me
        </button>
      )}
    </div>
  );
};
