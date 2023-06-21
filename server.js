var http = require("http"); // Import Node.js core module
var fs = require("fs");

var gameName = "2raab";
var defaultRole = "grey-gambler";

// var gameName = 'werewords';
// var defaultRole = 'villager';

var gameId = getRandomInt(1000);

var rolesText = fs.readFileSync(`./${gameName}/roles.txt`, "utf-8");
// \r\n for windows
// \n for linux
var roles = rolesText.split("\n");
var usedRoles = [];
var players = new Map();

var server = http.createServer(function (req, res) {
  var ignoreUrls = ["/", "/favicon.ico", "/.env"];
  if (!ignoreUrls.includes(req.url)) {
    console.log(req.url);
  }

  if (req.url == "/") {
    //check the URL of the current request
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(
      "<html><body><p>Welcome to Michael's Amazing Role Picker!</p></body></html>"
    );
    res.end();
  } else if (req.url == "/admin-michael") {
    res.writeHead(200, { "Content-Type": "text/html" });
    addFavicon(res);
    res.write("<html><body><p>");
    res.write('<meta http-equiv="refresh" content="5" >');
    res.write(`<h1>Admin Page - (${players.size})</h1>`);
    printGameHeader(res);
    res.write("<hr>");
    for (let [key, value] of players) {
      res.write(`<b>Name</b>: ${value["name"]} <br>`);
      res.write(`<b>Value</b>: ${value["role"]} <br>`);
      res.write(`<b>IP</b>: ${value["ip"]} <br>`);
      res.write("<b>Description</b>: <br>" + getRoleDescription(value["role"]));
      res.write("<br>------<br>");
    }
    res.write("<hr>");
    res.write("<h2>DEBUG</h2>");
    res.write("Roles: " + JSON.stringify(roles, null, 2));
    res.write("<br>");
    res.write("Used Roles: " + JSON.stringify(usedRoles, null, 2));
    res.write("<br>");
    res.write("");
    res.write("</p></body></html>");
    res.end();
  } else if (req.url == "/register") {
    res.writeHead(200, { "Content-Type": "text/html" });
    addFavicon(res);
    res.write("<html><body><p>");
    res.write(`<h1>Register Page</h1>`);
    res.write("Please use your real name!!<br><br>");
    res.write('<label for="name">Name:</label>');
    res.write('<input type="text" id="name" name="name"><br><br>');
    res.write('<button onclick="onClickButton()">Submit</button>');
    res.write("<script>");
    res.write("function onClickButton() {");
    res.write(
      ` document.getElementById("name").value && window.location.replace("/player/" + document.getElementById("name").value);`
    );
    res.write("}");
    res.write("</script>");
    res.write("</p></body></html>");
    res.end();
  } else if (req.url.startsWith("/player/")) {
    var playerName = req.url.split("/").pop();

    // IP Check
    // var player = findPlayerByIp(req.socket.remoteAddress);
    // if (!player) {
    //     player = players.get(playerName);
    // }

    // No IP Check
    var player = players.get(playerName);

    if (!player) {
      var role = getRandomUnusedRole();
      player = {
        name: playerName,
        role: role,
        ip: req.socket.remoteAddress,
      };
      usedRoles.push(role);
      players.set(playerName, player);
    }

    if (player.ip != req.socket.remoteAddress) {
      res.end(
        '<iframe src="https://giphy.com/embed/rqjLK44Y4HSMI5iOjk" width="480" height="480" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>'
      );
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      addFavicon(res);
      res.write("<html><body><p>");
      res.write('<meta http-equiv="refresh" content="10" >');
      res.write(`<h1>Player Page</h1>`);
      printGameHeader(res);
      res.write("<hr>");
      res.write("<b>Name</b>: " + player.name);
      res.write("<br>");
      res.write("<b>Role</b>: " + player.role);
      res.write("<br>");
      res.write("<b>Description</b>: <br>" + getRoleDescription(player.role));
      res.write("<br>");
      res.write("<hr>");
      res.write("Roles: " + JSON.stringify(roles, null, 2));
      res.write("</p></body></html>");
      res.end();
    }
  } else {
    res.end(
      '<iframe src="https://giphy.com/embed/rqjLK44Y4HSMI5iOjk" width="480" height="480" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>'
    );
  }
});

function addFavicon(res) {
  var faviconHTML = fs.readFileSync("favicon.html", "utf-8");
  res.write("<head>");
  res.write(faviconHTML);
  res.write("</head>");
}

function printGameHeader(res) {
  res.write("<b>Game</b>: " + gameName);
  res.write("<br>");
  res.write("<b>GameId</b>: " + gameId);
  res.write("<br>");
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomUnusedRole() {
  var unusedRoles = roles.filter((value) => !usedRoles.includes(value));
  if (unusedRoles.length == 0) {
    return defaultRole;
  }
  var randomInt = getRandomInt(unusedRoles.length);
  return unusedRoles[randomInt];
}

function getRoleAndGroup(role) {
  var roleArray = [];
  var roleSplit = role.split(" ");
  roleArray.push(roleSplit[0]);
  if (roleSplit[2]) {
    roleArray.push(roleSplit[2]);
  }
  return roleArray;
}

function getRoleDescription(role) {
  try {
    var pureRole = role.split(" ")[0];
    var description = fs.readFileSync(
      `./${gameName}/roles/${pureRole}.html`,
      "utf-8"
    );
    return description;
  } catch {
    return "NOT FOUND";
  }
}

function findPlayerByIp(ip) {
  for (let [key, value] of players) {
    if (value.ip == ip) {
      return value;
    }
  }
}

server.listen(5000);

console.log("Node.js web server at port 5000 is running..");
