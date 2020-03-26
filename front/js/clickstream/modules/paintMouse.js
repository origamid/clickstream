const createMouseElement = () => {
  const mouse = document.createElement("div");
  mouse.style.cssText = `
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    top: 0px;
    left: 0px;
    transition: 0.1s;
    border: 2px solid rgba(0, 0, 0, 0.5);
    background: hsl(${360 * Math.random()}, 100%, 65%);
  `;
  document.body.appendChild(mouse);
  return mouse;
};

const onMove = (x, y, mouse) => {
  mouse.style.transform = `translate(${x}px, ${y}px)`;
};

const onClick = mouse => {
  mouse.style.boxShadow = `0 0 0 5px black`;
  setTimeout(() => {
    mouse.style.boxShadow = `0 0 0 0 black`;
  }, 100);
};

const paintMouse = data => {
  const mouse = createMouseElement();
  if (data.length) {
    const start = data[0].time;
    data.forEach(item => {
      setTimeout(() => {
        if (item.type === "mousemove") onMove(item.x, item.y, mouse);
        if (item.type === "click") onClick(mouse);
      }, item.time - start);
    });
  }
};

export default paintMouse;
