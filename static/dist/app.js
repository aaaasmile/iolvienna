class App extends React.Component {
  render() {
    return React.createElement("div", null, React.createElement("div", {
      className: "ui minimal comments"
    }, React.createElement("h3", {
      className: "ui dividing header"
    }, "Esplora")), React.createElement(Commander, null), React.createElement(Posts, null));
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
    });
  }

  render() {
    return React.createElement("div", {
      className: "ui left icon action input"
    }, React.createElement("i", {
      className: "search icon"
    }), React.createElement("input", {
      id: "contcmd",
      type: "text",
      placeholder: "Cerca...",
      onKeyUp: ev => {
        if (ev.key === 'Enter') {
          let val = $('#contcmd').val();
          console.log('Enter recognized: ', val);
          this.serverRequest(val);
          $('#contcmd').val('');
        }
      }
    }), React.createElement("button", {
      className: "ui icon right attached primary button",
      onClick: () => {
        this.serverRequest($('#contcmd').val());
      }
    }, React.createElement("i", {
      className: "paper plane icon"
    })));
  }

}

class Posts extends React.Component {
  render() {
    return React.createElement("div", {
      className: "comment"
    });
  }

}

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));