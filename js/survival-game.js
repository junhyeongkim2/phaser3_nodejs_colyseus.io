import MainScene from "./MainScene.js";
import Phaser from "phaser";

const config = {
  width: 512,
  height: 512,
  backgroundColor: "#333333",
  type: Phaser.AUTO,
  parent: "survival-game",
  physics: {
    default: "matter",
    matter: {
      debug: true,
      gravity: { y: 0 },
    },
  },
  scale: { zoom: 2 },
  scene: [MainScene],
};

const game = new Phaser.Game(config);
