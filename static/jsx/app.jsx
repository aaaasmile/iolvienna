class App extends React.Component {
  render() {
    return (
      <div>
        <div className="ui minimal comments">
          <h3 className="ui dividing header">Esplora</h3>
        </div>
        <Commander></Commander>
        <Posts></Posts>
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
    
    this.serverRequest = this.serverRequest.bind(this);
  }

  serverRequest(cmd) {
    var ser = $.param({ "req": cmd })
    var url = 'do?' + ser
    console.log('POST to ', url)
    $.post(url, res => {
      console.log('Res is:', res)
    })
  }

  render() {
    return (
      <div className="ui left icon action input">
        <i className="search icon"></i>
        <input type="text" placeholder="Cerca..."></input>
        <button className="ui icon right attached primary button" onClick={() => this.serverRequest('oca')}><i className="paper plane icon"></i>
        </button>
      </div >
    )
  }
}

class Posts extends React.Component {
  render() {
    return (
      <div className="comment">
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));