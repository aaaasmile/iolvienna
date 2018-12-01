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
      }
    }

    switch (cmd) {
      case "?":
      case "aiuto":
        console.log('Aiuto requested')
        this.showHelp()
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
        this.serverRequest(req)
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
    this.setState({ help: false, posts: [], error: "" })
  }

  serverRequest(cmd) {
    if (!cmd) {
      console.log('cmd is empty')
      return
    }
    var ser = $.param({ "req": cmd })
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewState({ posts: pp.Posts })
      // pp.Posts.forEach(element => {
      //console.log(element)
      // });
    })
  }

  requestPostsOnDate(date) {
    var ser = $.param({ "date": date })
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setNewState({ posts: pp.Posts })
    })
  }

  movePostsOnDate(forw) {
    if (this.state.posts.length > 0) {
      var date
      var ser
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
      }
      var url = 'do?' + ser
      console.log('POST to ', url)
      $.post(url, res => {
        //console.log('Res is:', res)
        var pp = JSON.parse(res)
        this.setNewState({ posts: pp.Posts })
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
              <div className="comment">
                {
                  this.state.posts.map(function (post, i) {
                    return <Post key={i} post={post} morePostsOnDate={that.requestPostsOnDate} />;
                  })
                }
              </div>
              <div >
                <a onClick={() => this.movePostsOnDate(false)}><i className="backward icon"></i></a> <a onClick={() => this.movePostsOnDate(true)}><i className="forward icon"></i></a>
              </div>
            </div>
            : null
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
    return gg + '/' + mm + '/' + date.getFullYear()
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