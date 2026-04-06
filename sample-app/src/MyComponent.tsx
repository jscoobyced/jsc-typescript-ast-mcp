import { MyContent } from "./MyContent";

const MyComponent = ({ title }) => {
  const titleContent = (
    <h1
      style={{
        fontSize: "1.5em",
        margin: "0.5em 0",
      }}
    >
      {title}
    </h1>
  );

  const myWeirdLogicToDetermineIfButtonShouldBeIncluded = () => {
    // This is just a placeholder for some complex logic that determines if the button should be included.
    return title.length > 10;
  };

  const isIncludeButton = myWeirdLogicToDetermineIfButtonShouldBeIncluded();

  return (
    <div>
      {titleContent}
      <MyContent
        contentText={[
          "This is the story of MyComponent.",
          "It contains a title and some content.",
          "By the way this is not a haiku, just a simple content.",
        ]}
        includeButton={isIncludeButton}
      />
    </div>
  );
};

export default MyComponent;
