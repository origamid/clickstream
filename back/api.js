const http = require("http");
const fs = require("fs");
const path = require("path");
const DATA_DIR = path.join(__dirname, "data");

function api_get(req, res) {
  fs.readdir(DATA_DIR, (err, files) => {
    if (err) throw err;
    const jsonFiles = files
      .filter(f => f.slice(f.length - 5) === ".json")
      .map(f => f.replace(".json", ""));
    res.write(JSON.stringify(jsonFiles));
    res.end();
  });
}

function api_id_get(req, res) {
  const fileName = req.url.split("/")[2];
  const file = path.join(DATA_DIR, fileName) + ".json";

  fs.readFile(file, (err, json) => {
    if (json) res.write(json.toString());
    res.end();
  });
}

function api_id_post(req, res) {
  const fileName = req.url.split("name=")[1];
  const file = path.join(DATA_DIR, fileName) + ".json";

  let data = [];
  req.on("data", chunk => data.push(chunk));
  req.on("end", () => {
    const body = Buffer.concat(data).toString();
    if (body.length > 2) {
      fs.writeFile(file, body, err => {
        if (err) throw err;
        res.write(body);
        res.end();
      });
    }
  });
}

function handleServer(req, res) {
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });

  // Router
  if (req.url === "/api/") {
    api_get(req, res);
  } else if (req.url.indexOf("/api/") > -1 && req.method === "POST") {
    api_id_post(req, res);
  } else if (req.url.indexOf("/api/") > -1 && req.method === "GET") {
    api_id_get(req, res);
  } else {
    res.end("Sem Rota");
  }
}

http.createServer(handleServer).listen(3001);
