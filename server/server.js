const { MongoClient } = require("mongodb");

// mongodb 사용자 db와 collection uri 입니다 : 다음에 설정한 비밀번호를 넣으시면 됩니다
const uri =
  "mongodb+srv://singmeta:0000@cluster0.eqbzf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

// client에 mongoclient 정의
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const http = require("http");
const express = require("express");
const cors = require("cors");
const colyseus = require("colyseus");
const monitor = require("@colyseus/monitor").monitor;
// const socialRoutes = require("@colyseus/social/express").default;

const PokeWorld = require("./rooms/PokeWorld").PokeWorld;

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new colyseus.Server({
  server: server,
});

// register your room handlers
gameServer
  .define("poke_world", PokeWorld)
  .on("create", (room) => console.log("room created:", room.roomId))
  .on("dispose", (room) => console.log("room disposed:", room.roomId))
  .on("join", (room, client) => console.log(client.id, "joined", room.roomId))
  .on("leave", (room, client) => console.log(client.id, "left", room.roomId))
  .on("onMessage", (room) => console.log("this is on message" + room.res));

// ToDo: Create a 'chat' room for realtime chatting

//gameServer.on("on_Message", (room) => console.log("onMessage", room.res));

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/authentication/)
 * - also uncomment the require statement
 */
// app.use("/", socialRoutes);

// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor(gameServer));

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);

app.get("/write", (req, res) => {
  res.send("<h1>mongodb write function</h1>");

  client.connect(async (err) => {
    const collection = client.db("singmeta").collection("singmeta");

    // perform actions on the collection object

    const doc = { name: "졸작데이터1", shape: "round" };
    const result = await collection.insertOne(doc);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);

    client.close();
  });
});

//mongo db read 라우트 - junhyeong pizza를 collection에서 찾아서 cursor에 넣어주고 배열화 시켜서 console.log를 찍어준다
app.get("/read", (req, res) => {
  client.connect(async (err) => {
    const collection = client.db("singmeta").collection("singmeta");
    const cursor = collection.find({});
    const allValues = await cursor.toArray();

    // perform actions on the collection object

    client.close();

    res.send(allValues);
  });
});
