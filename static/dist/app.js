class App extends React.Component {
  render() {
    return React.createElement("div", null, React.createElement("div", {
      className: "ui minimal comments"
    }, React.createElement("h3", {
      className: "ui dividing header"
    }, "Esplora, cerca e comanda")), React.createElement(Commander, null));
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
      }
    }

    switch (cmd) {
      case "?":
      case "aiuto":
        console.log('Aiuto requested');
        this.showHelp();
        break;

      case "clr":
        this.clearResult();
        break;

      case "data":
        console.log('Date post request');
        let ddreq = this.makeDateForReq(arg, err => {
          console.log('Parse error:', err);
          this.setNewState({
            error: err
          });
        });

        if (ddreq) {
          this.requestPostsOnDate(ddreq);
        }

        break;

      default:
        console.log('Server search request');
        this.serverRequest(req);
        break;
    }
  }

  setNewState(obj) {
    this.clearResult();
    this.setState(obj);
  }

  makeDateForReq(datestr, errFn) {
    let arr = datestr.split('/');

    if (arr.length !== 3) {
      errFn('Data non è nel formato corretto (es. data corretta 23/12/2007)');
      return;
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

  showHelp() {
    this.setNewState({
      help: true
    });
  }

  clearResult() {
    this.setState({
      help: false,
      posts: [],
      error: "",
      req: ""
    });
  }

  serverRequest(cmd) {
    if (!cmd) {
      console.log('cmd is empty');
      return;
    }

    var ser = $.param({
      "req": cmd
    });
    var url = 'do?' + ser;
    console.log('POST to ', url);
    $.post(url, res => {
      console.log('Res is:', res);
      var pp = JSON.parse(res);
      this.setNewState({
        posts: pp.Posts,
        req: cmd
      }); // pp.Posts.forEach(element => {
      //console.log(element)
      // });
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
        posts: pp.Posts,
        req: this.formatDate(date)
      });
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
      }

      var url = 'do?' + ser;
      console.log('POST to ', url);
      $.post(url, res => {
        //console.log('Res is:', res)
        var pp = JSON.parse(res);
        this.setNewState({
          posts: pp.Posts
        });
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
    }, this.state.posts && this.state.posts.length > 0 ? React.createElement("div", null, this.state.req ? React.createElement("div", {
      className: "ui small header"
    }, "Risultati per: ", React.createElement("i", null, this.state.req)) : null, React.createElement("div", {
      className: "comment"
    }, this.state.posts.map(function (post, i) {
      return React.createElement(Post, {
        key: i,
        post: post,
        morePostsOnDate: that.requestPostsOnDate
      });
    })), React.createElement("div", null, React.createElement("a", {
      onClick: () => this.movePostsOnDate(false)
    }, React.createElement("i", {
      className: "backward icon"
    })), " ", React.createElement("a", {
      onClick: () => this.movePostsOnDate(true)
    }, React.createElement("i", {
      className: "forward icon"
    })))) : null, React.createElement(Help, {
      help: this.state.help
    }), React.createElement(Error, {
      err: this.state.error
    })));
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
    return React.createElement("div", {
      id: "errMsg"
    }, this.props.err ? React.createElement("div", {
      className: "ui error message"
    }, React.createElement("div", {
      className: "header"
    }, "Errore"), React.createElement("div", null, this.props.err)) : null);
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
    return React.createElement("div", {
      id: "helpid"
    }, this.props.help ? React.createElement("div", {
      className: "ui message"
    }, React.createElement("div", {
      className: "header"
    }, "Aiuto"), React.createElement("div", null, "I comandi che si possono utilizzare sono sempre prefissati dai due punti:", React.createElement("ul", null, React.createElement("li", null, React.createElement("b", null, ":aiuto"), React.createElement("br", null), "mostra questa schermata"), React.createElement("li", null, React.createElement("b", null, ":?"), React.createElement("br", null), "mostra questa schermata"), React.createElement("li", null, React.createElement("b", null, ":data"), " ", React.createElement("i", null, "segue una data in formato gg/mm/aaaa."), " ", React.createElement("br", null), "Per esempio, per vedere i post del 27 gennaio 2003 si usa:", React.createElement("br", null), ":data 27/01/2003"), React.createElement("li", null, React.createElement("b", null, ":clr"), React.createElement("br", null), "cancella il risultato"), React.createElement("li", null, React.createElement("i", null, "Parola o frase che non sia un comando"), React.createElement("br", null), "Esegue una ricerca all'interno di tutti posts e ne presenta un risultato limitato.")), "Nei lista dei post \xE8 possibile selezionarne uno cliccando sulla data. Da questo punto si segue lo stream dei messaggi.")) : null);
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

  render() {
    return React.createElement("div", {
      className: "ui postId"
    }, React.createElement("div", {
      className: "content"
    }, React.createElement("div", {
      className: "author"
    }, this.props.post.UserName), React.createElement("div", {
      className: "metadata"
    }, React.createElement("a", {
      className: "date",
      onClick: () => {
        this.props.morePostsOnDate(this.props.post.Date);
      }
    }, this.formatDate(this.props.post.Date))), React.createElement("div", {
      className: "text"
    }, this.props.post.Content)));
  }

}

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));