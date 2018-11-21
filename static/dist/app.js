class App extends React.Component {
  render() {
    return React.createElement("p", null, "Wow this is a APP!!");
  }

}

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));