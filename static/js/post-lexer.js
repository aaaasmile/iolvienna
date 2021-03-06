//const passPhrase = "ciao a tutti, come va?!\rMa mi sbaglio ho si voleva fare un' apero?   \r\r Surf World Cup dal 1.-4.05 Podersdorf \rChi fosse interessato a biglietti gratuiti mi faccia sapere.\r\ra presto"
//const passPhrase = "Josè lumas De Oliveira, mai sentito(sul fmaigerato google ho trovato questo oltre l'imagine di un vecchietto:[\"http://www.jornalprimeirahora.com.br/imagens/noticias/luma_21_05_08.jpg\":http://www.jornalprimeirahora.com.br/imagens/noticias/luma_21_05_08.jpg])\rOra però hai stuzzicato la curiosità cho è costui? \r\rJavier Bardem è lui ---> [\"http://www.contactmusic.com/pics/m/oscars_pressroom_240208/javier_bardem_5095236.jpg\":http://www.contactmusic.com/pics/m/oscars_pressroom_240208/javier_bardem_5095236.jpg] ultimo premio oscar come miglior attore maschile \r\rAhhh questo terrence qua: [\"http://lh5.ggpht.com/_YTsfWmtb6gY/SJMD9qzvYKI/AAAAAAAAAKk/YjN5o3Amsps/candy+e+terence4.jpg\":http://lh5.ggpht.com/_YTsfWmtb6gY/SJMD9qzvYKI/AAAAAAAAAKk/YjN5o3Amsps/candy+e+terence4.jpg] sorry nna vevo letto bene... \r\rma ribatto ke a me candy candy annoiava  era + poteten si qualsiasi altro sonnifero!\r\rL'opera magari un'altra volta!"
//const passPhrase = "a\rb"
//const passPhrase = "\rbaba\r"
//const passPhrase = "lo[\"ciao\":htpp://invido.it]fine"

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

  function traverseTree(tree) {
    //console.log('Traverse tree')
    res = tree.map((val, ix) => {
      let pp = Object.assign(val.prop, { key: ix })
      return React.createElement(val.tag, pp, val.children)
    })
    return res
  }

  lex.procPost = function (post) {
    let l = lex.lexCtor("Post lex", post)
    let rr = []//React.createElement("div")
    let link = ""
    let label = ""
    let i = 1
    while (1) {
      let item = l.nextItem()
      if (item) {
        //console.log("%d %s val: %s (%s)", item.typ, lex.debugType(item.typ), item.val, lex.hexEncode(item.val))
        switch (item.typ) {
          case tokType_LfCr:
            rr.push({ tag: 'br', prop: {}, children: null })
            break
          case tokType_Text:
            rr.push({ tag: 'div', prop: {}, children: item.val })
            break
          case tokType_UrlLabel:
            label = item.val
            break
          case tokType_UrlLink:
            link = item.val
            break
          default:
            break
        }
        if ((item.typ === tokType_UrlLabel) || (item.typ === tokType_UrlLink)) {
          if ((label !== '') && (link !== '')) {
            rr.push({ tag: 'a', prop: { href: link, target: "_blank" }, children: label })
            link = ''
            label = ''
          }
        }
      }

      if (l.state === null) {
        break
      }
      i += 1
      if (i > 1000) {
        console.error('Parser error')
        return React.createElement("div", null, post)
      }
    }
    return React.createElement("div", null, traverseTree(rr))
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

    _lexer.stBraLeftLabel = function (fnCbTyp) {
      let rune = _lexer.next()
      if (!rune) {
        return null
      }
      _lexer.ignore()

      if (rune === ":") {
        if (_lexer.next() === null) {
          return null
        }
        _lexer.ignore()
      }
      while (1) {
        if (_lexer.input[_lexer.pos] === ']') {
          fnCbTyp(tokType_UrlLabel)
          if (_lexer.next() === null) {
            return null
          }
          _lexer.ignore()
          return _lexer.stText
        }
        if (_lexer.next() === null) {
          break
        }
      }
      return _lexer.stText
    }

    _lexer.stBraLeftLinkInStr = function (fnCbTyp) {
      if (_lexer.next() === null) {
        return null
      }
      _lexer.ignore()
      while (1) {
        if (_lexer.input[_lexer.pos] === '"') {
          fnCbTyp(tokType_UrlLink)
          return _lexer.stBraLeftLabel
        }
        if (_lexer.next() === null) {
          return null
        }
      }
      return _lexer.stText
    }

    _lexer.stBraLeftLink = function (fnCbTyp) {
      if (_lexer.next() === null) {
        return null
      }
      _lexer.ignore()
      while (1) {
        if (_lexer.input[_lexer.pos] === '"') {
          return _lexer.stBraLeftLinkInStr
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
          return _lexer.stBraLeftLink // next state
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
//console.log('Input is:', passPhrase)
//const strHtml = lex.procPost(passPhrase)
//console.log('Process post: %s, len %d', strHtml, strHtml.length)