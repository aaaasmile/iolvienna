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

  render() {
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
        <div className="ui">
          <div className="comment">
            {this.state.posts.map(function (post, i) {
              return <Post key={i} post={post} />;
            })}
          </div>
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
  render() {
    return (
      <div className="ui postId">
        <div className="content">
          <a className="author">{this.props.post.UserName}</a>
          <div className="metadata">
            <span className="date">{this.props.post.Date}</span>
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