import Phaser from "phaser";
import { onlinePlayers, room } from "./SocketServer";

import Player from "./Player";
import OnlinePlayer from "./OnlinePlayer";

import TCRP from "phaser3-rex-plugins/plugins/tcrp.js";

let cursors, socketKey;
var axios = require("axios");
var singmetatext = "";
var recorder = new TCRP.Recorder(Scene2);

export class Scene2 extends Phaser.Scene {
  constructor() {
    super("playGame");
  }

  init(data) {
    // Map data
    this.mapName = data.map;

    // Player Texture starter position
    this.playerTexturePosition = data.playerTexturePosition;

    // Set container
    this.container = [];

    console.log(this.mapName);
    console.log(this.playerTexturePosition);
    console.log(this.container);
  }

  create() {
    this.input.keyboard.on("keydown-A", function (event) {
      room.then((room) =>
        room.send({
          event: "Key_Press_A",
          gametext: "this is local to colyseus server data_A ",
        })
      );

      room.then((room) => room.onMessage({ event: "Key_Press_A" }));

      console.log("Hello from the A!");
    });

    this.input.keyboard.on("keydown-S", function (event) {
      var config = {
        method: "get",
        url: "http://localhost:3000/read",
        headers: {},
      };

      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data[0].name));
          singmetatext = JSON.stringify(response.data[0].name);
          console.log(singmetatext);
        })
        .catch(function (error) {
          console.log(error);
        });
      console.log("Hello from the S!");
    });
    this.input.keyboard.on("keydown-D", function (event) {
      console.log("Hello from the D!");
    });
    this.input.keyboard.on("keydown-F", function (event) {
      var config = {
        method: "get",
        url: "http://localhost:3000/read",
        headers: {},
      };

      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data[0]._id));
          singmetatext = JSON.stringify(response.data[0]._id);
          console.log(singmetatext);
        })
        .catch(function (error) {
          console.log(error);
        });
      console.log("Hello from the F!");
    });

    this.input.keyboard.on("keydown-SPACE", function (event) {
      console.log("Hello from the Space Bar!");

      recorder.start();

      setTimeout(() => {
        console.log("세 번째 메시지" + recorder.isRecording);
        recorder.stop();
        console.log("세 번째 메시지" + recorder.isRecording);
      }, 2000);

      recorder.addCommand(["firsttest"]);

      var gc = recorder.getCommands();

      console.log("this is record console" + gc);
    });
    this.input.keyboard.on(Phaser.Events, function (event) {
      console.log(event.key);
    });

    this.map = this.make.tilemap({ key: this.mapName });

    // Set current map Bounds
    this.scene.scene.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = this.map.addTilesetImage(
      "tuxmon-sample-32px-extruded",
      "TilesTown"
    );

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    this.belowLayer = this.map.createStaticLayer("Below Player", tileset, 0, 0);
    this.worldLayer = this.map.createStaticLayer("World", tileset, 0, 0);
    this.grassLayer = this.map.createStaticLayer("Grass", tileset, 0, 0);
    this.aboveLayer = this.map.createStaticLayer("Above Player", tileset, 0, 0);

    this.worldLayer.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    this.aboveLayer.setDepth(10);

    // Get spawn point from tiled map
    const spawnPoint = this.map.findObject(
      "SpawnPoints",
      (obj) => obj.name === "Spawn Point"
    );

    // Set player
    this.player = new Player({
      scene: this,
      worldLayer: this.worldLayer,
      key: "player",
      x: spawnPoint.x,
      y: spawnPoint.y,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    cursors = this.input.keyboard.createCursorKeys();

    // Help text that has a "fixed" position on the screen

    this.debugGraphics();

    this.movementTimer();
  }

  update(time, delta) {
    // Loop the player update method
    this.player.update(time, delta);

    this.add
      .text(200, 200, singmetatext, {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 20 },
        backgroundColor: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(30);
    // console.log('PlayerX: ' + this.player.x);
    // console.log('PlayerY: ' + this.player.y);

    // Horizontal movement
    if (cursors.left.isDown) {
      if (socketKey) {
        if (this.player.isMoved()) {
          room.then((room) =>
            room.send({
              event: "PLAYER_MOVED",
              position: "left",
              x: this.player.x,
              y: this.player.y,
            })
          );
        }
        socketKey = false;
      }
    } else if (cursors.right.isDown) {
      if (socketKey) {
        if (this.player.isMoved()) {
          room.then((room) =>
            room.send({
              event: "PLAYER_MOVED",
              position: "right",
              x: this.player.x,
              y: this.player.y,
            })
          );
        }
        socketKey = false;
      }
    }

    // Vertical movement
    if (cursors.up.isDown) {
      if (socketKey) {
        if (this.player.isMoved()) {
          room.then((room) =>
            room.send({
              event: "PLAYER_MOVED",
              position: "back",
              x: this.player.x,
              y: this.player.y,
            })
          );
        }
        socketKey = false;
      }
    } else if (cursors.down.isDown) {
      if (socketKey) {
        if (this.player.isMoved()) {
          room.then((room) =>
            room.send({
              event: "PLAYER_MOVED",
              position: "front",
              x: this.player.x,
              y: this.player.y,
            })
          );
        }
        socketKey = false;
      }
    }

    // Horizontal movement ended
    if (Phaser.Input.Keyboard.JustUp(cursors.left) === true) {
      room.then((room) =>
        room.send({ event: "PLAYER_MOVEMENT_ENDED", position: "left" })
      );
    } else if (Phaser.Input.Keyboard.JustUp(cursors.right) === true) {
      room.then((room) =>
        room.send({ event: "PLAYER_MOVEMENT_ENDED", position: "right" })
      );
    }

    // Vertical movement ended
    if (Phaser.Input.Keyboard.JustUp(cursors.up) === true) {
      room.then((room) =>
        room.send({ event: "PLAYER_MOVEMENT_ENDED", position: "back" })
      );
    } else if (Phaser.Input.Keyboard.JustUp(cursors.down) === true) {
      room.then((room) =>
        room.send({ event: "PLAYER_MOVEMENT_ENDED", position: "front" })
      );
    }
  }

  movementTimer() {
    setInterval(() => {
      socketKey = true;
    }, 50);
  }

  debugGraphics() {
    // Debug graphics
    this.input.keyboard.once("keydown_D", (event) => {
      // Turn on physics debugging to show player's hitbox
      this.physics.world.createDebugGraphic();

      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
      this.worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
      });
    });
  }
}
