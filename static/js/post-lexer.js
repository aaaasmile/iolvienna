//const passPhrase = "ciao a tutti, come va?!\rMa mi sbaglio ho si voleva fare un' apero?   \r\r Surf World Cup dal 1.-4.05 Podersdorf \rChi fosse interessato a biglietti gratuiti mi faccia sapere.\r\ra presto"
//const passPhrase = "Josè lumas De Oliveira, mai sentito(sul fmaigerato google ho trovato questo oltre l'imagine di un vecchietto:[\"http://www.jornalprimeirahora.com.br/imagens/noticias/luma_21_05_08.jpg\":http://www.jornalprimeirahora.com.br/imagens/noticias/luma_21_05_08.jpg])\rOra però hai stuzzicato la curiosità cho è costui? \r\rJavier Bardem è lui ---\u003e [\"http://www.contactmusic.com/pics/m/oscars_pressroom_240208/javier_bardem_5095236.jpg\":http://www.contactmusic.com/pics/m/oscars_pressroom_240208/javier_bardem_5095236.jpg] ultimo premio oscar come miglior attore maschile \r\rAhhh questo terrence qua: [\"http://lh5.ggpht.com/_YTsfWmtb6gY/SJMD9qzvYKI/AAAAAAAAAKk/YjN5o3Amsps/candy+e+terence4.jpg\":http://lh5.ggpht.com/_YTsfWmtb6gY/SJMD9qzvYKI/AAAAAAAAAKk/YjN5o3Amsps/candy+e+terence4.jpg] sorry nna vevo letto bene... \r\rma ribatto ke a me candy candy annoiava  era + poteten si qualsiasi altro sonnifero!\r\rL'opera magari un'altra volta!"
const passPhrase = "a\rb"

const lex = {};
(function () {
  const tokType_Text = 0
  const tokType_LfCr = 1
  const tokType_UrlLabel = 2
  const tokType_UrlLink = 3

  lex.hexEncode = function (str) {
    let hex, i;

    let result = "";
    for (i = 0; i < str.length; i++) {
      hex = str.charCodeAt(i).toString(16);
      if (result !== '') {
        result += ' '
      }
      result += ("000" + hex).slice(-4);
    }
    return result
  }

  lex.debugType = function (typ) {
    switch (typ) {
      case tokType_Text:
        return "Text"
      case tokType_LfCr:
        return "LfCr"
      case tokType_UrlLabel:
        return "UrlLabel"
      case tokType_UrlLink:
        return "UrlLink"
    }
    return "typ is unknown"
  }

  lex.procPost = function (post) {
    let l = lex.lexCtor("Post lex", post)
    let rr = ""
    let exit = false
    while (1) {
      let item = l.nextItem()
      if (!item) {
        break
      }
      console.log("%d %s val: %s (%s)", item.typ, lex.debugType(item.typ), item.val, lex.hexEncode(item.val))
      switch (item.typ) {
        case tokType_LfCr:
          rr += "<br />"
          break
        case tokType_Text:
          rr += item.val
          break
        default:
          exit = true
          break
      }
      if ((l.state === null) || exit) {
        break
      }
    }
    return rr
  }

  lex.lexCtor = function (name, input) {
    const _lexer = {
      name: name,
      input: input,
      state: null,
      start: 0,
      pos: 0,
      prev_pos: -1,
      prev_state: null,
    };

    _lexer.nextItem = function () {
      if (!_lexer.state) {
        return null
      }

      if ((_lexer.prev_state === _lexer.state) &&
        (_lexer.prev_pos === _lexer.pos)) {
        throw ("State stale")
      }
      _lexer.prev_pos = _lexer.pos
      _lexer.prev_state = _lexer.state

      let item = null
      _lexer.state = _lexer.state(x => {
        item = {
          typ: x,
          val: _lexer.input.substr(_lexer.start, _lexer.pos - _lexer.start)
        }
      })
      return item
    }

    _lexer.next = function () {
      _lexer.pos += 1
      return _lexer.pos >= _lexer.input.length ? null : _lexer.input[_lexer.pos]
    }

    _lexer.ignore = function () {
      _lexer.start = _lexer.pos
    }

    _lexer.backup = function () {
      if (_lexer.pos > 0) {
        _lexer.pos -= 1
      }
    }

    _lexer.peek = function () {
      let pn = _lexer.next()
      _lexer.backup()
      return pn
    }

    _lexer.stBraLeftLink = function (fnCbTyp) {
      _lexer.pos += 1
      _lexer.start = _lexer.pos
      while (1) {
        if (_lexer.peek() === ']') {
          fnCbTyp(tokType_UrlLink)
          return _lexer.stText
        }
        if (_lexer.next() === null) {
          break
        }
      }
      return _lexer.stText
    }

    _lexer.stBraLeftLabel = function (fnCbTyp) {
      _lexer.pos += 1
      _lexer.start = _lexer.pos
      while (1) {
        if (_lexer.input[_lexer.pos] === ':') {
          fnCbTyp(tokType_UrlLabel)
          return _lexer.stBraLeftLink
        }
        if (_lexer.next() === null) {
          return null
        }
      }
      return _lexer.stText
    }

    _lexer.stCrLf = function (fnCbTyp) {
      let r = _lexer.next()
      _lexer.ignore()
      fnCbTyp(tokType_LfCr)
      return r ? _lexer.stText : null
    }

    _lexer.stText = function (fnCbTyp) {
      while (1) {
        if (_lexer.input[_lexer.pos] === '\r') {
          fnCbTyp(tokType_Text)
          return _lexer.stCrLf // next state
        }
        else if (_lexer.input[_lexer.pos] === '[') {
          fnCbTyp(tokType_Text)
          return _lexer.stBraLeft // next state
        }
        if (_lexer.next() === null) {
          break
        }
      }
      if (_lexer.pos > _lexer.start) {
        fnCbTyp(tokType_Text)
      }
      return null
    }

    _lexer.state = _lexer.stText // initial state

    return _lexer
  }
})();

//console.log(_itemText)
console.log('Input is:', passPhrase)
const strHtml = lex.procPost(passPhrase)
console.log('Process post: %s, len %d', strHtml, strHtml.length)