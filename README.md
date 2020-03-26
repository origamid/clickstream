# Clickstream e Heatmap

Ferramenta de coleta de movimento/click com JavaScript e Node.js

---

## Pré-requisitos

- JavaScript

  <https://www.origamid.com/curso/javascript-completo-es6/>

- Instalar o Node.js

  <https://www.origamid.com/curso/javascript-completo-es6/0103-vscode-node-e-git>

- Terminal

  <https://www.origamid.com/curso/javascript-completo-es6/1001-linha-de-comando>

---

## Coletar Dados

A primeira função a ser criada é reponsável por coletar o movimento e o click do usuário.

```js
// trackClickstream.js sem otimização
const trackClickstream = () => {
  const data = [];

  // Envia as coordenadas X / Y, Timestamp e tipo de evento
  const pushEventData = ({ pageX, pageY, type }) => {
    data.push({
      time: Date.now(),
      x: pageX,
      y: pageY,
      type,
    });
  };

  // Adiciona os eventos ao move e click (não otimizado)
  document.addEventListener("mousemove", pushEventData);
  document.addEventListener("click", pushEventData);

  return data;
};

export default trackClickstream;
```

---

## Plugins de Heatmap

- heatmap.js

  <https://github.com/pa7/heatmap.js>

- simpleheat

  <https://github.com/mourner/simpleheat>

- webgl-heatmap

  <https://github.com/pyalot/webgl-heatmap>

- VisualHeatmapJs

  <https://github.com/nswamy14/visual-heatmap>

---

## Pintar o Heatmap

Utilizando o heatmap.js

```html
<!-- index.html -->
<!-- Carregar o heatmap antes do script -->
<script src="./js/clickstream/dependencies/heatmap.min.js"></script>
<script type="module" src="./js/script.js"></script>
```

```js
// paintHeatmap.js
// h337 é o nome da função disponibilizada pelo heatmap.js
// external dependencie: heatmap.js
const paintHeatmap = (data, max) => {
  // Iniciar o heatmap definindo o container dele
  // estou utilizando a tag HTML que vem de documentElement
  const heatmap = h337.create({
    container: document.documentElement,
  });
  // Max é o número máximo de pontos para ficar vermelha a área
  // data é uma array de objetos. O objeto deve possui { x: Number, y: Number}
  heatmap.setData({
    data,
    max,
  });
  return heatmap;
};
export default paintHeatmap;
```

---

## Heatmap Live

Se quiser que o heatmap seja pintado enquato o usuário mexe, para demonstrações

```js
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
```

---

## Paint Mouse

Refaz o caminho do mouse feito pelo usuário

```js
// paintMouse.js
// Criamos um novo elemento
const createMouseElement = () => {
  const mouse = document.createElement("div");
  /*
    Definimos o estilo direto no JS, para não
    dependermos de um arquivo .css externo.
    O background é aleatório com HSL
  */
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

// Posição modificada com o translate
const onMove = (x, y, mouse) => {
  mouse.style.transform = `translate(${x}px, ${y}px)`;
};

// Ao click cria um efeito de sombra
const onClick = mouse => {
  mouse.style.boxShadow = `0 0 0 5px black`;
  setTimeout(() => {
    mouse.style.boxShadow = `0 0 0 0 black`;
  }, 100);
};

const paintMouse = data => {
  const mouse = createMouseElement();
  // Pega o tempo do primeiro elemento
  if (data.length) {
    const start = data[0].time;
    data.forEach(item => {
      // Para cada item define um timeout com base
      // No tempo em que o evento ocorreu - o primeiro event
      setTimeout(() => {
        if (item.type === "mousemove") onMove(item.x, item.y, mouse);
        if (item.type === "click") onClick(mouse);
      }, item.time - start);
    });
  }
};

export default paintMouse;
```

---

## Servidor Node.js

Servidor básico, sem dependências em Node.js para gravar arquivos .json e ler arquivos .json

```js
// Requer os módulos de http, fs e path
const http = require("http");
const fs = require("fs");
// Define a pasta em que ficará os dados
// O path join é necessário pois no windows
// o caminho pode possuir / ou \
const path = require("path");
const DATA_DIR = path.join(__dirname, "data");

// Handler no caso de uma requisição GET
function api_get(req, res) {
  // Lê o diretório /data/ retorna uma array com a lista de nomes
  fs.readdir(DATA_DIR, (err, files) => {
    if (err) throw err;
    res.write(JSON.stringify(files.map(f => f.replace(".json", ""))));
    res.end();
  });
}

// Handler no caso de uma requisição GET com ID
function api_id_get(req, res) {
  const fileName = req.url.split("/")[2];
  const file = path.join(DATA_DIR, fileName) + ".json";

  // Lê o arquivo JSON e retorna ele
  fs.readFile(file, (err, json) => {
    if (json) res.write(json.toString());
    res.end();
  });
}

// Handler no caso de uma requisição POST com ID
function api_id_post(req, res) {
  // Nome do arquivo, com base no URL
  const fileName = req.url.split("name=")[1];
  const file = path.join(DATA_DIR, fileName) + ".json";

  // Variável para segurar os dados do POST
  let data = [];
  // Enquanto tiver dados, envia os pedaços para data
  req.on("data", chunk => data.push(chunk));
  // Ao final da requisição
  req.on("end", () => {
    // Data ainda é um buffer, transformar em string
    const body = Buffer.concat(data).toString();
    // Escreve o resultado na api
    fs.writeFile(file, body, err => {
      if (err) throw err;
      res.end();
    });
  });
}

// Lida com o servidor
function handleServer(req, res) {
  // Escreve o header do servidor
  // Permite acesso de URLS diferentes e headers com content-type
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });

  // Router
  // Se tiver /api apenas no URL, ativa a função api_get
  if (req.url === "/api/") {
    api_get(req, res);

    // Se tiver /api apenas no URL e o método for POST ativa api_id_post
  } else if (req.url.indexOf("/api/") > -1 && req.method === "POST") {
    api_id_post(req, res);

    // Se tiver /api apenas no URL e o método for GET ativa api_id_get
  } else if (req.url.indexOf("/api/") > -1 && req.method === "GET") {
    api_id_get(req, res);
  } else {
    res.end("Sem Rota");
  }
}

// Cria o servidor com a função handleServer e observa a porta 3001
http.createServer(handleServer).listen(3001);
```

---

## Api

Agora você precisa salvar os dados em um arquivo .json e carregar os mesmos

```js
// api.js
const postData = (url, data) => {
  // Posta com o nome baseado no timestamp
  const name = Date.now();
  fetch(`${url}/?name=${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

const getData = async (url, total) => {
  // Puxa o URL inicial e transforma em JSON,
  // O URL possui uma lista de arquivos salvos no servidor
  const dataResponse = await fetch(url + "/");
  const dataJson = await dataResponse.json();

  // Da lista salva, seleciona os últimos TOTAL de itens da ARRAY, com o slice
  // Puxa com o fetch os dados de cada item e transforma em json
  const eachResponse = await Promise.all(
    dataJson.slice(Math.max(dataJson.length - total, 0)).map(name => fetch(`${url}/${name}`)),
  );
  return await Promise.all(eachResponse.map(item => item.json()));
};

export { postData, getData };
```

---

## Clickstream

Interface com class

```js
// Clickstream.js
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
```

---

## Otimizar Mousemove

```js
// normalizeFPS.js
const normalizeFPS = callback => {
  let ticking = true;
  const update = () => {
    if (ticking) requestAnimationFrame(update);
    ticking = true;
  };
  return event => {
    if (ticking) {
      callback(event);
      update();
    }
    ticking = false;
  };
};

export default normalizeFPS;
```

```js
// trackClickstream.js
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

  // o normalizeFPS retorna uma função que só é ativada
  // no máximo 1 vez a cada 16ms
  document.addEventListener("mousemove", normalizeFPS(pushEventData));
  document.addEventListener("click", pushEventData);

  return data;
};

export default trackClickstream;
```

---

## Código final

```html
<script src="./js/clickstream/dependencies/heatmap.min.js"></script>
<script type="module" src="./js/script.js"></script>
```

```js
import Clickstream from "./clickstream/Clickstream.js";

const clickstream = new Clickstream("http://127.0.0.1:3001/api", 3);
clickstream.track();
clickstream.mouse();
```

---
