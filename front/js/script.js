import Clickstream from "./clickstream/Clickstream.js";

const clickstream = new Clickstream("http://127.0.0.1:3001/api", 10);

clickstream.track();
clickstream.live();
setTimeout(() => clickstream.post(), 1000);
window.onbeforeunload = () => clickstream.post();

clickstream.heatmap();
