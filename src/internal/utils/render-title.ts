import gradient from "gradient-string";
import packageJson from "../../../package.json" with {type: "json"};

const colors = {
  x: "#606060",
  a: "#FEEAC9",
  b: "#FFCDC9",
  c: "#FDACAC",
  d: "#FD7979",
};

const titleText = `
|   __   _______ _______
|  |  |_|       |   _   |
|  |   _|___|   |.  |   |
|  |____|/  ___/|.  |   |
|  types|:  :   |:  :   |
|     to|::.. . |::.. . |
|       \`-------\`-------'
|  ${packageJson.version}`;

export const renderTitle = () => {
  const gradientText = gradient(Object.values(colors));
  // console.log(gradientText.multiline(titleText));
  return gradientText.multiline(titleText);
};
