class App extends React.Component {
  constructor(props) {
    super(props);
    console.log("APP is build in constructor")
    this.onInfoClick = this.onInfoClick.bind(this)
    this.commanderRef = React.createRef();
  }

  onInfoClick() {
    console.log("Info clicked in APP")
    this.commanderRef.current.showInfo();
  }

  render() {
    return (
      <div>
        <button className="ui right floated button icon" onClick={this.onInfoClick}><i className="info circle icon"></i></button>
        <div className="ui minimal comments">
          <h4 className="ui dividing header">Esplora, cerca e comanda</h4>
          <Commander ref={this.commanderRef}></Commander>
        </div>
      </div>
    )
  }
}

//////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// COMMANDER 
//////////////////////////////////////////////////////////////////////////////////////

class Commander extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: []
    };

    this.requestPostsOnDate = this.requestPostsOnDate.bind(this)
    this.parseRequest = this.parseRequest.bind(this)
    this.randomPostReq = this.randomPostReq.bind(this)
    this.restoreOnHistory()

    let params = document.location.hash
    console.log('Commander created: ', params)
    let aa = this.parse_query_string(params);
    let that = this
    for (let key in aa) {
      if (!aa.hasOwnProperty(key)) continue;
      let req = ":" + that.convKeyToCommand(key) + that.getkeyToCmdArg(key, aa[key])
      console.log('Request:', req)
      this.parseRequest(req)
      break;
    }
  }

  getkeyToCmdArg(k, v) {
    if (k === "rnd" && v === 'all') {
      return ''
    }
    return ' ' + decodeURIComponent(v)
  }


  convKeyToCommand(key) {
    switch (key) {
      case 'rnd':
        return 'caso'
      case 'rndonuser':
        return 'caso'
    }
    return key
  }

  parse_query_string(query_full) {
    query_full = decodeURIComponent(query_full)
    console.log(query_full)
    let aa = query_full.split('?')
    if (aa.length !== 2) {
      return {}
    }
    let query = aa[1]
    let vars = query.split("&");
    let query_string = {};
    for (let i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      var key = decodeURIComponent(pair[0]);
      var value = decodeURIComponent(pair[1]);
      if (typeof query_string[key] === "undefined") {
        query_string[key] = decodeURIComponent(value);
      } else if (typeof query_string[key] === "string") {
        var arr = [query_string[key], decodeURIComponent(value)];
        query_string[key] = arr;
      } else {
        query_string[key].push(decodeURIComponent(value));
      }
    }
    return query_string;
  }

  restoreOnHistory() {
    window.addEventListener('popstate', e => {
      console.log('browser go back')
      this.setNewState(e.state)
    })
  }

  showInfo() {
    console.log("Show info in commander")
    this.setNewStateHist({ info: true }, `info`, `./#info`)
  }

  showHelp() {
    this.setNewStateHist({ help: true }, `help`, `./#help`)
  }

  parseRequest(req) {
    let arg = ""
    let cmd = ""
    if (req.indexOf(":") === -1) {
      cmd = ""
    } else {
      let words = req.split(':');
      cmd = words[1].trim()
    }
    if (cmd) {
      arg = cmd.split(' ')
      if (arg.length > 1) {
        cmd = arg[0]
        arg = arg[1] //support only one argument
      } else {
        arg = ""
      }
    }

    switch (cmd) {
      case "?":
      case "aiuto":
        console.log('Aiuto requested')
        this.showHelp()
        break
      case "caso":
        console.log("Random post request:", arg)
        this.randomPostReq(arg)
        break
      case "clr":
        this.clearResult()
        break
      case "u":
      case "utenti":
        this.usersReq()
        break;
      case "id":
        console.log("Request id on:", arg)
        this.reqId(arg)
        break;
      case "data":
        console.log('Date post request')
        let ddreq = this.makeDateForReq(arg, err => {
          console.log('Parse error:', err)
          this.setNewState({ error: err }) // no history on error
        })
        if (ddreq) {
          this.requestPostsOnDate(ddreq)
        }
        break
      case "datemore":
      case "dateless":
      case "date":
        console.log('Date post request')
        if (arg) {
          this.requestPostsOnDate(arg)
        }
        break
      default:
        console.log('Server search request')
        this.serverSearchRequest(req)
        break
    }
  }

  setNewState(obj) {
    this.clearResult()
    this.setState(obj)
  }

  setNewStateHist(obj, title, url) {
    this.clearResult()
    this.setState(obj, () => history.pushState(this.state, title, url))
  }

  makeDateForReq(datestr, errFn) {
    let arr = datestr.split('/')
    if (arr.length !== 3) {
      if (datestr.length === 6) {
        arr = []
        arr.push(datestr.slice(0, 2))
        arr.push(datestr.slice(2, 4))
        arr.push(datestr.slice(4, 6))
      } else {
        errFn('Data non è nel formato corretto (es. data corretta 23/12/2007)')
        return
      }
    }
    let gg = parseInt(arr[0])
    if (gg < 1 || gg > 31) {
      errFn('Mese non è nel formato corretto (1-31)')
      return
    }
    let mm = parseInt(arr[1])
    if (mm < 1 || mm > 12) {
      errFn('Mese non è nel formato corretto (1-12)')
      return
    }
    if (arr[2].length === 2) {
      arr[2] = "20" + arr[2]
    }
    let yy = parseInt(arr[2])
    if (yy < 2000 || yy > 2099) {
      errFn('Anno non è nel formato corretto')
      return
    }
    if (gg < 10) {
      gg = "0" + gg
    }
    if (mm < 10) {
      mm = "0" + mm
    }
    let strdate = `${yy}-${mm}-${gg}T00:00:00.000Z`
    return strdate
  }

  clearResult() {
    this.setState({
      help: false, posts: [], ispost: false, users: [],
      isuser: false, error: "", req: "", lblreq: "", info: false
    })
  }

  randomPostReq(arg) {
    var ser
    if (arg) {
      ser = $.param({ "rndonuser": arg })
    } else {
      ser = $.param({ "rnd": "all" })
    }
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      //console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewState({ ispost: true, posts: pp.Posts, lblreq: "comando ", req: (":caso " + arg) })
      history.pushState(this.state, `${url}`, `./#${url}`)
    })
  }

  reqId(arg) {
    var ser
    ser = $.param({ "postid": arg })
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      //console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewStateHist({ ispost: true, posts: pp.Posts, lblreq: "comando ", req: (":id " + arg) }, `${url}`, `./#${url}`)
    })
  }

  usersReq() {
    let ser = $.param({ "users": "all" })
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      //console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewState({ isuser: true, users: pp.Users, lblreq: "comando ", req: (":utenti") })
      history.pushState(this.state, `${url}`, `./#${url}`)
    })
  }

  serverSearchRequest(search) {
    if (!search) {
      console.log('search is empty')
      return
    }
    var ser = $.param({ "req": search })
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      //console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewState({ ispost: true, posts: pp.Posts, lblreq: " ricerca di ", req: search })
      history.pushState(this.state, `${url}`, `./#${url}`)
    })
  }

  requestPostsOnDate(date) {
    var ser = $.param({ "date": date })
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewState({ ispost: true, posts: pp.Posts, lblreq: "data = ", req: this.formatDate(date) })
      history.pushState(this.state, `${url}`, `./#${url}`)
    })
  }

  formatDate(datestr) {
    let post = new Post()
    return post.formatDate(datestr)
  }

  movePostsOnDate(forw) {
    if (this.state.posts.length > 0) {
      var date
      var ser
      var opstr = ">"
      if (forw) {
        // forward
        let last = this.state.posts[this.state.posts.length - 1]
        date = last.Date
        ser = $.param({ "datemore": date })
      } else {
        // backward
        let first = this.state.posts[0]
        date = first.Date
        ser = $.param({ "dateless": date })
        opstr = "<"
      }
      var url = 'do?' + ser
      console.log('POST to ', url)
      $.post(url, res => {
        //console.log('Res is:', res)
        var pp = JSON.parse(res)
        this.setNewState({ ispost: true, posts: pp.Posts, lblreq: " data " + opstr + " ", req: this.formatDate(date) })
        history.pushState(this.state, `${url}`, `./#${url}`)
      })
    }
  }

  render() {
    var that = this // importante per chiamare requestPostsOnDate
    return (
      <div>
        <div className="ui left icon action input">
          <i className="search icon"></i>
          <input id="contcmd" type="text" placeholder="prova con :aiuto" onKeyUp={(ev) => {
            if (ev.key === 'Enter') {
              let val = $('#contcmd').val()
              console.log('Enter recognized: ', val)
              this.parseRequest(val)
              $('#contcmd').val('')
            }
          }}></input>
          <button className="ui icon right attached primary button"
            onClick={() => {
              this.parseRequest($('#contcmd').val())
            }}><i className="paper plane icon"></i>
          </button>
        </div>
        <div className="ui" id="respost">
          {this.state.posts && (this.state.posts.length > 0) && this.state.ispost ?
            <div>
              {this.state.req ?
                <div className="ui small header">
                  Risultati {this.state.lblreq} <i>{this.state.req}</i>
                </div>
                : null}
              <div className="comment">
                {
                  this.state.posts.map(function (post, i) {
                    return <Post key={i} post={post} doreq={that.parseRequest} morePostsOnDate={that.requestPostsOnDate} />;
                  })
                }
              </div>
              <div >
                <button className="ui labeled icon button" onClick={() => this.movePostsOnDate(false)}>
                  <i className="left arrow icon"></i> Indietro
                </button>
                <button className="ui right labeled icon right floated button" onClick={() => this.movePostsOnDate(true)}>
                  <i className="right arrow icon"></i> Avanti
                </button>
              </div>
            </div>
            : <div>
              {this.state.req && this.state.ispost ?
                <div className="ui small header">
                  Nessun risultato per {this.state.lblreq} <i>{this.state.req}</i>. <br />Ricorda che i comandi vanno preceduti dai due punti. Per un elenco dei comandi disponibili usa :?
                </div>
                : null}
            </div>
          }
          <Help help={this.state.help}></Help>
          <Error err={this.state.error}></Error>
          <Info info={this.state.info} doreq={this.parseRequest}></Info>
          <Users users={this.state} rndOnUser={this.randomPostReq}></Users>
        </div>
      </div>
    )
  }
}

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// USERS
///////////////////////////////////////////////////////////////////////////////////
class Users extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    var that = this
    this.state = this.props.users;
    //console.log("Users state:", this.state)
    return (
      <div id="users">
        {this.state.users && this.state.users.length > 0 ?
          <div className="ui ordered list">
            {this.state.users.map(function (user, i) {
              return <a key={i} className="item" onClick={() => {
                that.props.rndOnUser(user.UserName)
              }}>{user.UserName} {user.NumMsg} messaggi</a>
            })}
          </div>
          : <div>
            {this.state.req && this.state.isuser ?
              <div className="ui small header">
                Nessun risultato per il comando {this.state.lblreq} <i>{this.state.req}</i>.
            </div>
              : null}
          </div>}
      </div>
    )
  }
}

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// ERRROR 
///////////////////////////////////////////////////////////////////////////////////

class Error extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div>
        {this.props.err ?
          <div id="errMsg">
            <div className="ui error message">
              <div className="header">
                Errore
              </div>
              <div>{this.props.err}</div>
            </div>
          </div>
          : null}
      </div>
    )
  }
}

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// HELP 
///////////////////////////////////////////////////////////////////////////////////

class Help extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        {this.props.help ?
          <div id="helpid">
            <div className="ui message">
              <div className="header">Aiuto</div>
              <div>
                I comandi che si possono utilizzare sono sempre prefissati dai due punti:
              <ul>
                  <li><b>:aiuto</b><br />mostra questa schermata</li>
                  <li><b>:?</b><br />mostra questa schermata</li>
                  <li><b>:data</b> <i>segue una data in formato gg/mm/aaaa.</i> <br />
                    Per esempio, per vedere i post del 27 gennaio 2003 si usa:<br />:data 27/01/2003<br />
                    Va bene anche il formato a 6 caratteri senza separatore:<br />:data 270103
                </li>
                  <li><b>:clr</b><br />cancella il risultato</li>
                  <li><b>:utenti</b><br />mostra l'elenco delgi utenti che hanno scritto messaggi</li>
                  <li><b>:u</b><br />mostra l'elenco delgi utenti che hanno scritto messaggi</li>
                  <li><b>:id</b> <i>segue un id di un post</i> <br /></li>
                  <li><b>:caso</b><br />
                    <i>seguito dal nome di utente</i><br />Ritorna dei post casuali relativi as un utente <br />
                    <i>senza nulla</i><br />Ritorna dei post casuali</li>
                  <li><i>Parola o frase che non sia un comando</i><br />Esegue una ricerca all'interno di tutti posts e ne presenta un risultato limitato.</li>
                </ul>
                Nei lista dei post è possibile selezionarne uno cliccando sulla data. Da questo punto si segue lo stream dei messaggi.
              </div>
            </div>
          </div>
          : null}
      </div>
    )
  }
}

///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// INFO
///////////////////////////////////////////////////////////////////////////////////

class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        {this.props.info ?
          <div>
            <h2 className="ui dividing header">Info su...</h2>
            <a onClick={() => { this.props.doreq(":data 080403") }}>
              <div className="ui raised segment">
                <p><i>Benvenuti Italians Viennesi!Ma che alla pizza eravate cosi pochi? Pochi fan di Beppe o pochi Italians a Vienna?</i></p>
              </div>
            </a> <br />
            <p>È stato questo il primo post nella sezione di Vienna di IOL. Parliamo dell'8 aprile 2003. Undici anni dopo: </p>
            <a onClick={() => { this.props.doreq(":data 061014") }}>
              <div className="ui raised segment">
                <p><i>beh, allora lo testo subito!! </i></p>
              </div>
            </a><br />
            <p>Si tratta dell'ultimo messaggio salvato dopo la scomparsa della sezione di Vienna di IOL. Il messaggio fu scritto il 6 ottobre 2014.</p>
            <p>In mezzo a questi due post, la bellezza di 20 803 messaggi che hanno rischiato di finire nell'oblio.
               Ma con questo progetto <b>IOL Vienna Vintage</b> ho voluto recuperare tutti messaggi del forum IOL sezione di Vienna rendendoli accessibili a chiunque.</p>
            <p>All'interno si trovano molte informazioni che riguardano Vienna. Ma è anche uno spaccato di come, in quel periodo, alcuni italiani che si sono trasferiti a Vienna
              comunicavano e scambiavano opinioni sui più vari argomenti. Il forum era anche un punto di ritrovo per organizzare eventi reali in città.</p>
            <p>Nel frattempo i modi di comunicare sono decisamente cambiati e la sezione di Vienna di IOL, come altri forum, ha seguito un lento e inesorabile declino
              fino alla definitiva chiusura in un momento buio e imprecisato di qualche anno fa.</p>
            <p>Ora <b>IOL Vienna Vintage</b> offre la possibilità di navigare in tutta quella miriade di messaggi, senza però la possibilità di aggiungerne di nuovi.</p>
            <p>Se questa necessità ci fosse o ci fosse stata, il forum non sarebbe di certo morto.</p>
            <p>Per inizare questo viaggio nel passato basta inserire un comando oppure una parola da cercare.</p>
            <p>Per esempio con la parola <a onClick={() => { this.props.doreq("chi cerca trova") }}>chi cerca trova</a>.
                I comandi a disposizione si hanno con <a onClick={() => { this.props.doreq(":?") }}>:?</a></p>
            <p>Buon divertimento! Vostro <a onClick={() => {
              this.props.doreq(":caso aaaasmile")
            }}>[aaaasmile]</a></p>
          </div>
          : null}
      </div>
    )
  }
}


///////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////// POST
///////////////////////////////////////////////////////////////////////////////////

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  formatDate(dateStr) {
    console.log('date to format is ', dateStr)
    let date = new Date(dateStr)
    let gg = "" + date.getDate()
    if (gg.length < 2) {
      gg = "0" + gg
    }
    let mm = "" + (date.getMonth() + 1)
    if (mm.length < 2) {
      mm = "0" + mm
    }
    let min = date.getMinutes()
    if (min < 10) {
      min = "0" + min
    }
    let hh = date.getHours()
    if (hh < 10) {
      hh = "0" + hh
    }
    return gg + '/' + mm + '/' + date.getFullYear() + " " + hh + ":" + min
  }

  createMarkup() {
    return { __html: lex.procPost(this.props.post.Content) };
  }

  render() {
    return (
      <div className="ui postId">
        <div className="content">
          <div className="ui two column grid">
            <div className="column">
              <div className="author"><a onClick={() => { this.props.doreq(":caso " + this.props.post.UserName) }}>{this.props.post.UserName}</a></div>
            </div>
            <div className="column">
              <div className="metadata">
                <a className="date" onClick={() => {
                  this.props.morePostsOnDate(this.props.post.Date)
                }
                }>{this.formatDate(this.props.post.Date)}</a>
              </div>
            </div>
          </div>
          <div className="text">
            {/* <div className="text" dangerouslySetInnerHTML={this.createMarkup()}> */}
            {lex.procPost(this.props.post.Content)}
            {/* {this.props.post.Content} */}
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
