const colyseus = require("colyseus");

const players = {};
var axios = require("axios");

exports.PokeWorld = class extends colyseus.Room {
  onCreate(options) {
    console.log("ON CREATE");
  }

  onJoin(player, options) {
    console.log("ON JOIN");

    players[player.sessionId] = {
      sessionId: player.sessionId,
      map: "town",
      x: 352,
      y: 1216,
    };

    setTimeout(
      () => this.send(player, { event: "CURRENT_PLAYERS", players: players }),
      500
    );
    this.broadcast(
      { event: "PLAYER_JOINED", ...players[player.sessionId] },
      { except: player }
    );
  }

  /*
  onMessage(data) {
    console.log("on message");
    if (data.event == "Key_Press") {
      console.log("check");
    }
  }
*/
  onMessage(player, data) {
    //console.log("ON MESSAGE1");

    if (data.event === "Key_Press_A") {
      console.log(data);

      var config = {
        method: "get",
        url: "http://localhost:3000/write",
        headers: {},
      };

      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    if (data.event === "PLAYER_MOVED") {
      players[player.sessionId].x = data.x;
      players[player.sessionId].y = data.y;

      this.broadcast(
        {
          event: "PLAYER_MOVED",
          ...players[player.sessionId],
          position: data.position,
        },
        { except: player }
      );
    }
    if (data.event === "PLAYER_MOVEMENT_ENDED") {
      this.broadcast(
        {
          event: "PLAYER_MOVEMENT_ENDED",
          sessionId: player.sessionId,
          map: players[player.sessionId].map,
          position: data.position,
        },
        { except: player }
      );
    }
    if (data.event === "PLAYER_CHANGED_MAP") {
      players[player.sessionId].map = data.map;

      // this.send(player, {event: "CURRENT_PLAYERS", players: players})

      this.broadcast({
        event: "PLAYER_CHANGED_MAP",
        sessionId: player.sessionId,
        map: players[player.sessionId].map,
        x: 300,
        y: 75,
        players: players,
      });
    }
  }

  onLeave(player, consented) {
    console.log("ON LEAVE");

    this.broadcast({
      event: "PLAYER_LEFT",
      sessionId: player.sessionId,
      map: players[player.sessionId].map,
    });
    delete players[player.sessionId];
  }

  onDispose() {
    console.log("ON DISPOSE");
  }
};
