class App extends React.Component {
  constructor(props) {
    super(props);
    console.log("APP is build in constructor");
    this.onInfoClick = this.onInfoClick.bind(this);
    this.commanderRef = React.createRef();
  }

  onInfoClick() {
    console.log("Info clicked in APP");
    this.commanderRef.current.showInfo();
  }

  render() {
    return React.createElement("div", null, React.createElement("button", {
      className: "ui right floated button icon",
      onClick: this.onInfoClick
    }, React.createElement("i", {
      className: "info circle icon"
    })), React.createElement("div", {
      className: "ui minimal comments"
    }, React.createElement("h4", {
      className: "ui dividing header"
    }, "Esplora, cerca e comanda"), React.createElement(Commander, {
      ref: this.commanderRef
    })));
  }

} //////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// COMMANDER 
//////////////////////////////////////////////////////////////////////////////////////


class Commander extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: []
    };
    this.requestPostsOnDate = this.requestPostsOnDate.bind(this);
    this.parseRequest = this.parseRequest.bind(this);
    this.randomPostReq = this.randomPostReq.bind(this);
    this.restoreOnHistory();
  }

  restoreOnHistory() {
    window.addEventListener('popstate', e => {
      console.log('browser go back');
      this.setNewState(e.state);
    });
  }

  showInfo() {
    console.log("Show info in commander");
    this.setNewStateHist({
      info: true
    }, `info`, `./#info`);
  }

  showHelp() {
    this.setNewStateHist({
      help: true
    }, `help`, `./#help`);
  }

  parseRequest(req) {
    let arg = "";
    let cmd = "";

    if (req.indexOf(":") === -1) {
      cmd = "";
    } else {
      let words = req.split(':');
      cmd = words[1].trim();
    }

    if (cmd) {
      arg = cmd.split(' ');

      if (arg.length > 1) {
        cmd = arg[0];
        arg = arg[1]; //support only one argument
      } else {
        arg = "";
      }
    }

    switch (cmd) {
      case "?":
      case "aiuto":
        console.log('Aiuto requested');
        this.showHelp();
        break;

      case "caso":
        console.log("Random post request:", arg);
        this.randomPostReq(arg);
        break;

      case "clr":
        this.clearResult();
        break;

      case "u":
      case "utenti":
        this.usersReq();
        break;

      case "id":
        console.log("Request id on:", arg);
        this.reqId(arg);
        break;

      case "data":
        console.log('Date post request');
        let ddreq = this.makeDateForReq(arg, err => {
          console.log('Parse error:', err);
          this.setNewState({
            error: err
          }); // no history on error
        });

        if (ddreq) {
          this.requestPostsOnDate(ddreq);
        }

        break;

      default:
        console.log('Server search request');
        this.serverSearchRequest(req);
        break;
    }
  }

  setNewState(obj) {
    this.clearResult();
    this.setState(obj);
  }

  setNewStateHist(obj, title, url) {
    this.clearResult();
    this.setState(obj, () => history.pushState(this.state, title, url));
  }

  makeDateForReq(datestr, errFn) {
    let arr = datestr.split('/');

    if (arr.length !== 3) {
      if (datestr.length === 6) {
        arr = [];
        arr.push(datestr.slice(0, 2));
        arr.push(datestr.slice(2, 4));
        arr.push(datestr.slice(4, 6));
      } else {
        errFn('Data non è nel formato corretto (es. data corretta 23/12/2007)');
        return;
      }
    }

    let gg = parseInt(arr[0]);

    if (gg < 1 || gg > 31) {
      errFn('Mese non è nel formato corretto (1-31)');
      return;
    }

    let mm = parseInt(arr[1]);

    if (mm < 1 || mm > 12) {
      errFn('Mese non è nel formato corretto (1-12)');
      return;
    }

    if (arr[2].length === 2) {
      arr[2] = "20" + arr[2];
    }

    let yy = parseInt(arr[2]);

    if (yy < 2000 || yy > 2099) {
      errFn('Anno non è nel formato corretto');
      return;
    }

    if (gg < 10) {
      gg = "0" + gg;
    }

    if (mm < 10) {
      mm = "0" + mm;
    }

    let strdate = `${yy}-${mm}-${gg}T00:00:00.000Z`;
    return strdate;
  }

  clearResult() {
    this.setState({
      help: false,
      posts: [],
      ispost: false,
      users: [],
      isuser: false,
      error: "",
      req: "",
      lblreq: "",
      info: false
    });
  }

  randomPostReq(arg) {
    var ser;

    if (arg) {
      ser = $.param({
        "rndonuser": arg
      });
    } else {
      ser = $.param({
        "rnd": "all"
      });
    }

    var url = 'do?' + ser;
    console.log('POST to ', url);
    $.post(url, res => {
      console.log('Res is:', res);
      var pp = JSON.parse(res);
      this.setNewState({
        ispost: true,
        posts: pp.Posts,
        lblreq: "comando ",
        req: ":caso " + arg
      });
      history.pushState(this.state, `${url}`, `./#${url}`);
    });
  }

  reqId(arg) {
    var ser;
    ser = $.param({
      "postid": arg
    });
    var url = 'do?' + ser;
    console.log('POST to ', url);
    $.post(url, res => {
      console.log('Res is:', res);
      var pp = JSON.parse(res);
      this.setNewStateHist({
        ispost: true,
        posts: pp.Posts,
        lblreq: "comando ",
        req: ":id " + arg
      }, `${url}`, `./#${url}`);
    });
  }

  usersReq() {
    let ser = $.param({
      "users": "all"
    });
    var url = 'do?' + ser;
    console.log('POST to ', url);
    $.post(url, res => {
      //console.log('Res is:', res)
      var pp = JSON.parse(res);
      this.setNewState({
        isuser: true,
        users: pp.Users,
        lblreq: "comando ",
        req: ":utenti"
      });
      history.pushState(this.state, `${url}`, `./#${url}`);
    });
  }

  serverSearchRequest(search) {
    if (!search) {
      console.log('search is empty');
      return;
    }

    var ser = $.param({
      "req": search
    });
    var url = 'do?' + ser;
    console.log('POST to ', url);
    $.post(url, res => {
      console.log('Res is:', res);
      var pp = JSON.parse(res);
      this.setNewState({
        ispost: true,
        posts: pp.Posts,
        lblreq: " ricerca di ",
        req: search
      });
      history.pushState(this.state, `${url}`, `./#${url}`);
    });
  }

  requestPostsOnDate(date) {
    var ser = $.param({
      "date": date
    });
    var url = 'do?' + ser;
    console.log('POST to ', url);
    $.post(url, res => {
      console.log('Res is:', res);
      var pp = JSON.parse(res);
      this.setNewState({
        ispost: true,
        posts: pp.Posts,
        lblreq: "data = ",
        req: this.formatDate(date)
      });
      history.pushState(this.state, `${url}`, `./#${url}`);
    });
  }

  formatDate(datestr) {
    let post = new Post();
    return post.formatDate(datestr);
  }

  movePostsOnDate(forw) {
    if (this.state.posts.length > 0) {
      var date;
      var ser;
      var opstr = ">";

      if (forw) {
        // forward
        let last = this.state.posts[this.state.posts.length - 1];
        date = last.Date;
        ser = $.param({
          "datemore": date
        });
      } else {
        // backward
        let first = this.state.posts[0];
        date = first.Date;
        ser = $.param({
          "dateless": date
        });
        opstr = "<";
      }

      var url = 'do?' + ser;
      console.log('POST to ', url);
      $.post(url, res => {
        //console.log('Res is:', res)
        var pp = JSON.parse(res);
        this.setNewState({
          ispost: true,
          posts: pp.Posts,
          lblreq: " data " + opstr + " ",
          req: this.formatDate(date)
        });
        history.pushState(this.state, `${url}`, `./#${url}`);
      });
    }
  }

  render() {
    var that = this; // importante per chiamare requestPostsOnDate

    return React.createElement("div", null, React.createElement("div", {
      className: "ui left icon action input"
    }, React.createElement("i", {
      className: "search icon"
    }), React.createElement("input", {
      id: "contcmd",
      type: "text",
      placeholder: "prova con :aiuto",
      onKeyUp: ev => {
        if (ev.key === 'Enter') {
          let val = $('#contcmd').val();
          console.log('Enter recognized: ', val);
          this.parseRequest(val);
          $('#contcmd').val('');
        }
      }
    }), React.createElement("button", {
      className: "ui icon right attached primary button",
      onClick: () => {
        this.parseRequest($('#contcmd').val());
      }
    }, React.createElement("i", {
      className: "paper plane icon"
    }))), React.createElement("div", {
      className: "ui",
      id: "respost"
    }, this.state.posts && this.state.posts.length > 0 && this.state.ispost ? React.createElement("div", null, this.state.req ? React.createElement("div", {
      className: "ui small header"
    }, "Risultati ", this.state.lblreq, " ", React.createElement("i", null, this.state.req)) : null, React.createElement("div", {
      className: "comment"
    }, this.state.posts.map(function (post, i) {
      return React.createElement(Post, {
        key: i,
        post: post,
        doreq: that.parseRequest,
        morePostsOnDate: that.requestPostsOnDate
      });
    })), React.createElement("div", null, React.createElement("button", {
      className: "ui labeled icon button",
      onClick: () => this.movePostsOnDate(false)
    }, React.createElement("i", {
      className: "left arrow icon"
    }), " Indietro"), React.createElement("button", {
      className: "ui right labeled icon right floated button",
      onClick: () => this.movePostsOnDate(true)
    }, React.createElement("i", {
      className: "right arrow icon"
    }), " Avanti"))) : React.createElement("div", null, this.state.req && this.state.ispost ? React.createElement("div", {
      className: "ui small header"
    }, "Nessun risultato per ", this.state.lblreq, " ", React.createElement("i", null, this.state.req), ". ", React.createElement("br", null), "Ricorda che i comandi vanno preceduti dai due punti. Per un elenco dei comandi disponibili usa :?") : null), React.createElement(Help, {
      help: this.state.help
    }), React.createElement(Error, {
      err: this.state.error
    }), React.createElement(Info, {
      info: this.state.info,
      doreq: this.parseRequest
    }), React.createElement(Users, {
      users: this.state,
      rndOnUser: this.randomPostReq
    })));
  }

} ///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// USERS
///////////////////////////////////////////////////////////////////////////////////


class Users extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var that = this;
    this.state = this.props.users; //console.log("Users state:", this.state)

    return React.createElement("div", {
      id: "users"
    }, this.state.users && this.state.users.length > 0 ? React.createElement("div", {
      className: "ui ordered list"
    }, this.state.users.map(function (user, i) {
      return React.createElement("a", {
        key: i,
        className: "item",
        onClick: () => {
          that.props.rndOnUser(user.UserName);
        }
      }, user.UserName, " ", user.NumMsg, " messaggi");
    })) : React.createElement("div", null, this.state.req && this.state.isuser ? React.createElement("div", {
      className: "ui small header"
    }, "Nessun risultato per il comando ", this.state.lblreq, " ", React.createElement("i", null, this.state.req), ".") : null));
  }

} ///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// ERRROR 
///////////////////////////////////////////////////////////////////////////////////


class Error extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return React.createElement("div", null, this.props.err ? React.createElement("div", {
      id: "errMsg"
    }, React.createElement("div", {
      className: "ui error message"
    }, React.createElement("div", {
      className: "header"
    }, "Errore"), React.createElement("div", null, this.props.err))) : null);
  }

} ///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// HELP 
///////////////////////////////////////////////////////////////////////////////////


class Help extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return React.createElement("div", null, this.props.help ? React.createElement("div", {
      id: "helpid"
    }, React.createElement("div", {
      className: "ui message"
    }, React.createElement("div", {
      className: "header"
    }, "Aiuto"), React.createElement("div", null, "I comandi che si possono utilizzare sono sempre prefissati dai due punti:", React.createElement("ul", null, React.createElement("li", null, React.createElement("b", null, ":aiuto"), React.createElement("br", null), "mostra questa schermata"), React.createElement("li", null, React.createElement("b", null, ":?"), React.createElement("br", null), "mostra questa schermata"), React.createElement("li", null, React.createElement("b", null, ":data"), " ", React.createElement("i", null, "segue una data in formato gg/mm/aaaa."), " ", React.createElement("br", null), "Per esempio, per vedere i post del 27 gennaio 2003 si usa:", React.createElement("br", null), ":data 27/01/2003", React.createElement("br", null), "Va bene anche il formato a 6 caratteri senza separatore:", React.createElement("br", null), ":data 270103"), React.createElement("li", null, React.createElement("b", null, ":clr"), React.createElement("br", null), "cancella il risultato"), React.createElement("li", null, React.createElement("b", null, ":utenti"), React.createElement("br", null), "mostra l'elenco delgi utenti che hanno scritto messaggi"), React.createElement("li", null, React.createElement("b", null, ":u"), React.createElement("br", null), "mostra l'elenco delgi utenti che hanno scritto messaggi"), React.createElement("li", null, React.createElement("b", null, ":id"), " ", React.createElement("i", null, "segue un id di un post"), " ", React.createElement("br", null)), React.createElement("li", null, React.createElement("b", null, ":caso"), React.createElement("br", null), React.createElement("i", null, "seguito dal nome di utente"), React.createElement("br", null), "Ritorna dei post casuali relativi as un utente ", React.createElement("br", null), React.createElement("i", null, "senza nulla"), React.createElement("br", null), "Ritorna dei post casuali"), React.createElement("li", null, React.createElement("i", null, "Parola o frase che non sia un comando"), React.createElement("br", null), "Esegue una ricerca all'interno di tutti posts e ne presenta un risultato limitato.")), "Nei lista dei post \xE8 possibile selezionarne uno cliccando sulla data. Da questo punto si segue lo stream dei messaggi."))) : null);
  }

} ///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// INFO
///////////////////////////////////////////////////////////////////////////////////


class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return React.createElement("div", null, this.props.info ? React.createElement("div", null, React.createElement("h2", {
      className: "ui dividing header"
    }, "Info su..."), React.createElement("a", {
      onClick: () => {
        this.props.doreq(":data 080403");
      }
    }, React.createElement("div", {
      className: "ui raised segment"
    }, React.createElement("p", null, React.createElement("i", null, "Benvenuti Italians Viennesi!Ma che alla pizza eravate cosi pochi? Pochi fan di Beppe o pochi Italians a Vienna?")))), " ", React.createElement("br", null), React.createElement("p", null, "\xC8 stato questo il primo post nella sezione di Vienna di IOL. Parliamo dell'8 aprile 2003. Undici anni dopo: "), React.createElement("a", {
      onClick: () => {
        this.props.doreq(":data 061014");
      }
    }, React.createElement("div", {
      className: "ui raised segment"
    }, React.createElement("p", null, React.createElement("i", null, "beh, allora lo testo subito!! ")))), React.createElement("br", null), React.createElement("p", null, "Si tratta dell'ultimo messaggio salvato dopo la scomparsa della sezione di Vienna di IOL. Il messaggio fu scritto il 6 ottobre 2014."), React.createElement("p", null, "In mezzo a questi due post, la bellezza di 20 803 messaggi che hanno rischiato di finire nell'oblio. Ma con questo progetto ", React.createElement("b", null, "IOL Vienna Vintage"), " ho voluto recuperare tutti messaggi del forum IOL sezione di Vienna rendendoli accessibili a chiunque."), React.createElement("p", null, "All'interno si trovano molte informazioni che riguardano Vienna. Ma \xE8 anche uno spaccato di come, in quel periodo, alcuni italiani che si sono trasferiti a Vienna comunicavano e scambiavano opinioni sui pi\xF9 vari argomenti. Il forum era anche un punto di ritrovo per organizzare eventi reali in citt\xE0."), React.createElement("p", null, "Nel frattempo i modi di comunicare sono decisamente cambiati e la sezione di Vienna di IOL, come altri forum, ha seguito un lento e inesorabile declino fino alla definitiva chiusura in un momento buio e imprecisato di qualche anno fa."), React.createElement("p", null, "Ora ", React.createElement("b", null, "IOL Vienna Vintage"), " offre la possibilit\xE0 di navigare in tutta quella miriade di messaggi, senza per\xF2 la possibilit\xE0 di aggiungerne di nuovi."), React.createElement("p", null, "Se questa necessit\xE0 ci fosse o ci fosse stata, il forum non sarebbe di certo morto."), React.createElement("p", null, "Per inizare questo viaggio nel passato basta inserire un comando oppure una parola da cercare."), React.createElement("p", null, "Per esempio con la parola ", React.createElement("a", {
      onClick: () => {
        this.props.doreq("chi cerca trova");
      }
    }, "chi cerca trova"), ". I comandi a disposizione si hanno con ", React.createElement("a", {
      onClick: () => {
        this.props.doreq(":?");
      }
    }, ":?")), React.createElement("p", null, "Buon divertimento! Vostro ", React.createElement("a", {
      onClick: () => {
        this.props.doreq(":caso aaaasmile");
      }
    }, "[aaaasmile]"))) : null);
  }

} ///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// POST
///////////////////////////////////////////////////////////////////////////////////


class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  formatDate(dateStr) {
    let date = new Date(dateStr);
    let gg = "" + date.getDate();

    if (gg.length < 2) {
      gg = "0" + gg;
    }

    let mm = "" + (date.getMonth() + 1);

    if (mm.length < 2) {
      mm = "0" + mm;
    }

    let min = date.getMinutes();

    if (min < 10) {
      min = "0" + min;
    }

    let hh = date.getHours();

    if (hh < 10) {
      hh = "0" + hh;
    }

    return gg + '/' + mm + '/' + date.getFullYear() + " " + hh + ":" + min;
  }

  createMarkup() {
    return {
      __html: lex.procPost(this.props.post.Content)
    };
  }

  render() {
    return React.createElement("div", {
      className: "ui postId"
    }, React.createElement("div", {
      className: "content"
    }, React.createElement("div", {
      className: "ui two column grid"
    }, React.createElement("div", {
      className: "column"
    }, React.createElement("div", {
      className: "author"
    }, React.createElement("a", {
      onClick: () => {
        this.props.doreq(":caso " + this.props.post.UserName);
      }
    }, this.props.post.UserName))), React.createElement("div", {
      className: "column"
    }, React.createElement("div", {
      className: "metadata"
    }, React.createElement("a", {
      className: "date",
      onClick: () => {
        this.props.morePostsOnDate(this.props.post.Date);
      }
    }, this.formatDate(this.props.post.Date))))), React.createElement("div", {
      className: "text"
    }, lex.procPost(this.props.post.Content))));
  }

}

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));