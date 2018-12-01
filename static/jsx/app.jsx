class App extends React.Component {
  render() {
    return (
      <div>
        <div className="ui minimal comments">
          <h3 className="ui dividing header">Esplora</h3>
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
    this.callMorePostsOnDate = this.callMorePostsOnDate.bind(this)
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
      this.setState({ posts: pp.Posts })
      // pp.Posts.forEach(element => {
      //console.log(element)
      // });
    })
  }

  callMorePostsOnDate(date) {
    var ser = $.param({ "date": date })
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      console.log('Res is:', res)
      var pp = JSON.parse(res)
      this.setState({ posts: pp.Posts })
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
    var that = this // importante per chiamare callMorePostsOnDate
    return (
      <div>
        <div className="ui left icon action input">
          <i className="search icon"></i>
          <input id="contcmd" type="text" placeholder="Cerca..." onKeyUp={(ev) => {
            if (ev.key === 'Enter') {
              let val = $('#contcmd').val()
              console.log('Enter recognized: ', val)
              this.serverRequest(val)
              $('#contcmd').val('')
            }
          }}></input>
          <button className="ui icon right attached primary button"
            onClick={() => {
              this.serverRequest($('#contcmd').val())
            }}><i className="paper plane icon"></i>
          </button>
        </div>
        <div className="ui" id="respost">
          <div className="comment">
            {
              this.state.posts.map(function (post, i) {
                return <Post key={i} post={post} morePostsOnDate={that.callMorePostsOnDate} />;
              })
            }
          </div>
          {this.state.posts && this.state.posts.length > 0 ?
            <div >
              <a onClick={() => this.movePostsOnDate(false)}><i className="backward icon"></i></a> <a onClick={() => this.movePostsOnDate(true)}><i className="forward icon"></i></a>
            </div>
            : null
          }
        </div>
      </div>
    )
  }
}

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };

  }

  formatDate(dateStr){
    let date = new Date(dateStr)
    let gg = "" + date.getDate()
    if (gg.length < 2) {
      gg = "0" + gg
    }
    let mm = "" + (date.getMonth() + 1)
    if (mm.length < 2){
      mm = "0" + mm
    }
    return gg + '/' + mm +  '/' + date.getFullYear()
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