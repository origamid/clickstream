// external dependencie: heatmap.js
const paintLive = (data, max) => {
  const heatmap = h337.create({
    container: document.documentElement,
  });
  const update = () => {
    heatmap.setData({
      max,
      data,
    });
    requestAnimationFrame(update);
  };
  update();
};

export default paintLive;
