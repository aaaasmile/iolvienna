class App extends React.Component {
  render() {
    return (
      <div>
        <div className="ui minimal comments">
          <h3 className="ui dividing header">Esplora, cerca e comanda</h3>
        </div>
        <Commander></Commander>
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
      case "data":
        console.log('Date post request')
        let ddreq = this.makeDateForReq(arg, err => {
          console.log('Parse error:', err)
          this.setNewState({ error: err })
        })
        if (ddreq) {
          this.requestPostsOnDate(ddreq)
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

  makeDateForReq(datestr, errFn) {
    let arr = datestr.split('/')
    if (arr.length !== 3) {
      errFn('Data non è nel formato corretto (es. data corretta 23/12/2007)')
      return
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

  showHelp() {
    this.setNewState({ help: true })
  }

  clearResult() {
    this.setState({ help: false, posts: [], error: "", req: "", lblreq: "" })
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
      console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewState({ posts: pp.Posts, lblreq: "comando ", req: (":caso " + arg) })
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
      console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewState({ posts: pp.Posts, lblreq: " ricerca di ", req: search })
    })
  }

  requestPostsOnDate(date) {
    var ser = $.param({ "date": date })
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewState({ posts: pp.Posts, lblreq: "data = ", req: this.formatDate(date) })
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
        this.setNewState({ posts: pp.Posts, lblreq: " data " + opstr + " ", req: this.formatDate(date) })
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
          {this.state.posts && this.state.posts.length > 0 ?
            <div>
              {this.state.req ?
                <div className="ui small header">
                  Risultati {this.state.lblreq} <i>{this.state.req}</i>
                </div>
                : null}
              <div className="comment">
                {
                  this.state.posts.map(function (post, i) {
                    return <Post key={i} post={post} morePostsOnDate={that.requestPostsOnDate} />;
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
              {this.state.req ?
                <div className="ui small header">
                  Nessun risultato per {this.state.lblreq} <i>{this.state.req}</i>. <br />Ricorda che i comandi vanno preceduti dai due punti. Per un elenco dei comandi disponibili usa :?
                </div>
                : null}
            </div>
          }
          <Help help={this.state.help}></Help>
          <Error err={this.state.error}></Error>
        </div>
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
      <div id="errMsg">
        {this.props.err ?
          <div className="ui error message">
            <div className="header">
              Errore
          </div>
            <div>{this.props.err}</div>
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
      <div id="helpid">
        {this.props.help ?
          <div className="ui message">
            <div className="header">Aiuto</div>
            <div>
              I comandi che si possono utilizzare sono sempre prefissati dai due punti:
              <ul>
                <li><b>:aiuto</b><br />mostra questa schermata</li>
                <li><b>:?</b><br />mostra questa schermata</li>
                <li><b>:data</b> <i>segue una data in formato gg/mm/aaaa.</i> <br />Per esempio, per vedere i post del 27 gennaio 2003 si usa:<br />:data 27/01/2003</li>
                <li><b>:clr</b><br />cancella il risultato</li>
                <li><b>:caso</b><br />
                  <i>seguito dal nome di utente</i><br />Ritorna dei post casuali relativi as un utente <br />
                  <i>senza nulla</i><br />Ritorna dei post casuali</li>
                <li><i>Parola o frase che non sia un comando</i><br />Esegue una ricerca all'interno di tutti posts e ne presenta un risultato limitato.</li>
              </ul>
              Nei lista dei post è possibile selezionarne uno cliccando sulla data. Da questo punto si segue lo stream dei messaggi.
          </div>
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

  render() {
    return (
      <div className="ui postId">
        <div className="content">
          <div className="author">{this.props.post.UserName}</div>
          <div className="metadata">
            <a className="date" onClick={() => {
              this.props.morePostsOnDate(this.props.post.Date)
            }
            }>{this.formatDate(this.props.post.Date)}</a>
          </div>
          <div className="text">
            {this.props.post.Content}
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));