import Clickstream from "./clickstream/Clickstream.js";

const clickstream = new Clickstream("http://127.0.0.1:3001/api", 10);

clickstream.track();
clickstream.live();

window.onbeforeunload = () => clickstream.post();

clickstream.mouse();
clickstream.heatmap();
