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

class Commander extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: []
    };
    this.requestPostsOnDate = this.requestPostsOnDate.bind(this)
  }

  parseRequest(req) {
    let words = req.split(':');
    let cmd = words[1]
    if (req.indexOf(":") === -1) {
      cmd = ""
    }
    switch (cmd) {
      case "aiuto":
        console.log('Aiuto requested')
        this.showHelp()
        break
      case "clr":
        this.clearResult()
        break
      default:
        this.serverRequest(req)
        break
    }
  }

  showHelp() {
    this.setState({ help: true, posts: [] })
  }

  clearResult(){
    this.setState({ help: false, posts: [] })
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
      this.setState({ posts: pp.Posts, help: false})
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
      this.setState({ posts: pp.Posts, help: false })
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
        this.setState({ posts: pp.Posts })
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
        </div>
      </div>
    )
  }
}

class Help extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        {this.props.help ?
          <div className="ui" id="helpid">
            <h3>Aiuto</h3>
            <div>
              I comandi che si possono utilizzare sono sempre prefissati dai due punti:
              <ul>
                <li><b>:aiuto</b><br />mostra questa schermata</li>
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