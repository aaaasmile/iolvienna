class App extends React.Component {
  render() {
    return (
      <div>
        <div className="ui minimal comments">
          <h3 className="ui dividing header">Esplora</h3>
          <div className="comment">
          </div>
        </div>
        <div className="ui left icon action input">
          <i className="search icon"></i>
          <input type="text" placeholder="Cerca..."></input>
          <button className="ui icon right attached primary button"><i className="paper plane icon"></i>
          </button>
        </div >
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));