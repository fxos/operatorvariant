var tabCounter = 0;
var FlatUIColors = [
  "#1abc9c",
  "#40d47e",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#16a085",
  "#27ae60",
  "#2980b9",
  "#8e44ad",
  "#2c3e50",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#f39c12",
  "#d35400",
  "#c0392b",
];

function Tab (opts) {
  var $ = document.getElementById.bind(document);
  var host = opts.host.replace(/\./g, "-");
  var color = FlatUIColors[FlatUIColors.length * Math.random() | 0];

  var card = document.createElement("x-card");
  card.id = "__" + tabCounter++;
  card.classList.add(host);
  card.style.backgroundColor = color;
  card.addEventListener("show", function () {
    if (this.tab.classList.contains("glow")) {
      this.tab.classList.remove("glow");
    }
  }.bind(this));

  var tab = document.createElement("x-tabbar-tab");
  tab.setAttribute("target-selector", "x-deck x-card#" + card.id);
  tab.textContent = opts.chan;
  tab.style.backgroundColor = color;
  tab.className = host;

  var log = document.createElement("div");
  log.className = "chat";
  log.onclick = this.openPrivate.bind(this);

  var input = document.createElement("input");
  input.className = "send";
  input.placeholder = document.webL10n.get("enter");
  input.onkeyup = this.send.bind(this);

  var part = document.createElement("img");
  part.src = "/close.png";
  part.onclick = this.doPart.bind(this);

  var userList = document.createElement("img");
  userList.src = "user.png";
  userList.onclick = function () { alert("userlist"); };

  var controls = document.createElement("div");
  controls.className = "part";
  controls.style.backgroundColor = color;
  controls.appendChild(userList);
  controls.appendChild(part);

  card.appendChild(log);
  card.appendChild(input);
  card.appendChild(controls);

  $("container").appendChild(card);
  $("tabbar").appendChild(tab);

  this.client = opts.client;
  this.chan = opts.chan;
  this.nick = opts.nick;
  this.host = opts.host;
  this.card = card;
  this.tab = tab;
  this.log = log;
  this.input = input;

  this.client.addListener("message" + opts.chan, this.onMessage.bind(this));

  var joinStr = document.webL10n.get("join", { channel: opts.chan });
  this.addText(this.nick, joinStr, "status");
};

Tab.prototype = {
  onMessage: function (from, data) {
    if ($("container").selectedCard.id !== this.card.id &&
        !this.tab.classList.contains("glow")) {
      this.tab.classList.add("glow");
    }
    this.addText(from, Utf8.decode(data));
  },

  send: function (e) {
    var say = this.input.value;
    if (e.keyCode === 13 && say) {
      this.input.value = null;
      this.client.say(this.chan, Utf8.encode(say));
      this.addText(this.nick, say);
    }
  },

  addText: function (user, text, type) {
    var timestamp = (new Date).toTimeString().substr(0, 5);
    var p = document.createElement("p");
    var html = timestamp + " &lt; ";

    var escapeText = this.escapeHtml(text);
    escapeText = escapeText.replace(/(http(s)?:\/\/[^ '"\n<>\]\[\*!@\(\)]+)/g, "<a href='$1' target='_blank'>$1</a>");

    if (type) {
      p.classList.add(type);
      html += escapeText;
    } else if (user === this.nick) {
      p.classList.add("mine");
      html += user + " &gt; " + escapeText;
    } else {
      html += "<a href='#" + user + "'>" + user + "</a> &gt; " + escapeText;
    }
    p.innerHTML = html;

    this.log.appendChild(p);
    this.log.scrollTop = this.log.scrollHeight;
  },

  openPrivate: function (e) {
    if (e.target.tagName === "A" && !e.target.target) {
      var name = e.target.textContent;

      if (!privMSG[name] && name !== this.nick) {
        privMSG[name] = new Tab({
          chan: name,
          client: this.client,
          nick: this.nick,
          host: this.host
        });
      }
    }
  },

  doPart: function () {
    if (this.chan[0] === "#") {
      this.client.part(this.chan);
    } else {
      delete privMSG[this.chan];
    }
    this.card.parentNode.removeChild(this.card);
    this.tab.parentNode.removeChild(this.tab);
    $("container").shuffleTo(0);
  },

  escapeChar: function (char, i, string) {
    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    var cleaned = entityMap[char];
    return cleaned ? cleaned : char;
  },

  escapeHtml: function (string) {
    return Array.prototype.map.call(string, this.escapeChar).join("");
  },
};

