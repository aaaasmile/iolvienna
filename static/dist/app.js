class App extends React.Component {
  render() {
    return React.createElement("div", null, React.createElement("div", {
      className: "ui minimal comments"
    }, React.createElement("h3", {
      className: "ui dividing header"
    }, "Esplora")), React.createElement(Commander, null));
  }

}

class Commander extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: []
    };
    this.callMorePostsOnDate = this.callMorePostsOnDate.bind(this);
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
      var pp = JSON.parse(res);
      this.setState({
        posts: pp.Posts
      }); // pp.Posts.forEach(element => {
      //console.log(element)
      // });
    });
  }

  callMorePostsOnDate(date) {
    var ser = $.param({
      "date": date
    });
    var url = 'do?' + ser;
    console.log('POST to ', url);
    $.post(url, res => {
      console.log('Res is:', res);
      var pp = JSON.parse(res);
      this.setState({
        posts: pp.Posts
      });
    });
  }

  movePostsOnDate(forw) {
    if (this.state.posts.length > 0) {
      var date;
      var ser;

      if (forw) {
        // forward
        let last = this.state.posts[this.state.posts.length - 1];
        date = last.Date;
        ser = $.param({
          "datemore": date
        });
      } else {
        // backward
        let first = this.state.posts[0];
        date = first.Date;
        ser = $.param({
          "dateless": date
        });
      }

      var url = 'do?' + ser;
      console.log('POST to ', url);
      $.post(url, res => {
        //console.log('Res is:', res)
        var pp = JSON.parse(res);
        this.setState({
          posts: pp.Posts
        });
      });
    }
  }

  render() {
    var that = this; // importante per chiamare callMorePostsOnDate

    return React.createElement("div", null, React.createElement("div", {
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
    }))), React.createElement("div", {
      className: "ui"
    }, React.createElement("div", {
      className: "comment"
    }, this.state.posts.map(function (post, i) {
      return React.createElement(Post, {
        key: i,
        post: post,
        morePostsOnDate: that.callMorePostsOnDate
      });
    })), this.state.posts && this.state.posts.length > 0 ? React.createElement("div", null, React.createElement("a", {
      onClick: () => this.movePostsOnDate(false)
    }, React.createElement("i", {
      className: "backward icon"
    })), " ", React.createElement("a", {
      onClick: () => this.movePostsOnDate(true)
    }, React.createElement("i", {
      className: "forward icon"
    }))) : null));
  }

}

class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return React.createElement("div", {
      className: "ui postId"
    }, React.createElement("div", {
      className: "content"
    }, React.createElement("div", {
      className: "author"
    }, this.props.post.UserName), React.createElement("div", {
      className: "metadata"
    }, React.createElement("a", {
      className: "date",
      onClick: () => {
        this.props.morePostsOnDate(this.props.post.Date);
      }
    }, this.props.post.Date)), React.createElement("div", {
      className: "text"
    }, this.props.post.Content)));
  }

}

ReactDOM.render(React.createElement(App, null), document.getElementById('app'));