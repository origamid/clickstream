import normalizeFPS from "./normalizeFPS.js";

const trackClickstream = () => {
  const data = [];

  const pushEventData = ({ pageX, pageY, type }) => {
    data.push({
      time: Date.now(),
      x: pageX,
      y: pageY,
      type,
    });
  };

  document.addEventListener("mousemove", normalizeFPS(pushEventData));
  document.addEventListener("click", pushEventData);

  return data;
};

export default trackClickstream;
