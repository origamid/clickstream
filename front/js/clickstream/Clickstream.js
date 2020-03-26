import trackClickstream from "./modules/trackClickstream.js";
import paintMouse from "./modules/paintMouse.js";
import paintHeatmap from "./modules/paintHeatmap.js";
import paintLive from "./modules/paintLive.js";
import { postData, getData } from "./modules/server.js";

export default class Clickstream {
  constructor(url, total) {
    this.url = url;
    this.total = total;
  }
  track() {
    this.clickstream = trackClickstream();
  }
  post() {
    postData(this.url, this.clickstream);
  }
  async get() {
    return await getData(this.url, this.total);
  }
  async mouse() {
    this.data = await this.get();
    if (this.data.length) this.data.forEach(paintMouse);
  }
  async heatmap(max = 10) {
    this.data = await this.get();
    if (this.data.length) paintHeatmap(this.data.flat(), max);
  }
  live(max = 5) {
    paintLive(this.clickstream, max);
  }
}
