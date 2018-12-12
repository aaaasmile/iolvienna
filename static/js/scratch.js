const passPhrase = "ciao a tutti, come va?!\rMa mi sbaglio ho si voleva fare un' apero?   \r\r Surf World Cup dal 1.-4.05 Podersdorf \rChi fosse interessato a biglietti gratuiti mi faccia sapere.\r\ra presto"


var lex = {};
(function () {
  const _itemText = 0;
  const _itemLfCr = 1;

  lex.procPost = function (post) {
    let l = lex.lexCtor("Text lex", post)
    let rr = ""
    while (1) {
      let item = l.nextItem()
      if (!item) {
        break
      }
      console.log("type %s, val %s", item.typ, item.val)
      if (item.typ == _itemLfCr) {
        rr += "<br />"
      } else if (item.typ === _itemText) {
        rr += item.val
      }
      if (l.state === null) {
        break
      }
    }
    return rr
  }

  lex.lexCtor = function (name, input) {
    var _lexer = {
      name: name,
      input: input,
      state: null,
      items: [],
      start: 0,
      pos: 0,
    };

    _lexer.nextItem = function () {
      if (_lexer.items.length === 0) {
        var _item = {
          typ: _itemText,
          val: _lexer.input
        }
        _lexer.state = null
        return _item;
      } else {
        return _lexer.items.pop();
      }
    }

    _lexer.emit = function (item) {
      _lexer.items.push(item)
    }

    _lexer.lexText = function () {
      while (1) {
        if (_lexer.next() === null) {
          break
        }
      }
      if (_lexer.pos > _lexer.start) {
        _lexer.emit(itemText)
      }
      return null
    }

    _lexer.state = _lexer.lexText

    return _lexer
  }
})();

console.log('Process post: ', lex.procPost(passPhrase))