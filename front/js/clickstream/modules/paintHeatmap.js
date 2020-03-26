// external dependencie: heatmap.js
const paintHeatmap = (data, max) => {
  const heatmap = h337.create({
    container: document.documentElement,
  });
  heatmap.setData({
    data,
    max,
  });
  return heatmap;
};

export default paintHeatmap;
