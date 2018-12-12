//const passPhrase = "ciao a tutti, come va?!\rMa mi sbaglio ho si voleva fare un' apero?   \r\r Surf World Cup dal 1.-4.05 Podersdorf \rChi fosse interessato a biglietti gratuiti mi faccia sapere.\r\ra presto"
const passPhrase = "Josè lumas De Oliveira, mai sentito(sul fmaigerato google ho trovato questo oltre l'imagine di un vecchietto:[\"http://www.jornalprimeirahora.com.br/imagens/noticias/luma_21_05_08.jpg\":http://www.jornalprimeirahora.com.br/imagens/noticias/luma_21_05_08.jpg])\rOra però hai stuzzicato la curiosità cho è costui? \r\rJavier Bardem è lui ---\u003e [\"http://www.contactmusic.com/pics/m/oscars_pressroom_240208/javier_bardem_5095236.jpg\":http://www.contactmusic.com/pics/m/oscars_pressroom_240208/javier_bardem_5095236.jpg] ultimo premio oscar come miglior attore maschile \r\rAhhh questo terrence qua: [\"http://lh5.ggpht.com/_YTsfWmtb6gY/SJMD9qzvYKI/AAAAAAAAAKk/YjN5o3Amsps/candy+e+terence4.jpg\":http://lh5.ggpht.com/_YTsfWmtb6gY/SJMD9qzvYKI/AAAAAAAAAKk/YjN5o3Amsps/candy+e+terence4.jpg] sorry nna vevo letto bene... \r\rma ribatto ke a me candy candy annoiava  era + poteten si qualsiasi altro sonnifero!\r\rL'opera magari un'altra volta!"

const lex = {};
(function () {
  const tokType_Text = 0;
  const tokType_LfCr = 1;

  lex.procPost = function (post) {
    let l = lex.lexCtor("Post lex", post)
    let rr = ""
    let exit = false
    while (1) {
      let item = l.nextItem()
      if (!item) {
        break
      }
      console.log("type %s, val %s", item.typ, item.val)
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
      return _lexer.pos >= _lexer.input.length ? null : _lexer.pos
    }

    _lexer.stCrLf = function (fnCbTyp) {
      _lexer.pos += 1
      _lexer.start = _lexer.pos
      fnCbTyp(tokType_LfCr)
      return _lexer.stText
    }

    _lexer.stText = function (fnCbTyp) {
      while (1) {
        // todo check for rule and 
        if (_lexer.input[_lexer.pos] === '\r') {
          fnCbTyp(tokType_Text)
          return _lexer.stCrLf // next state
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
console.log('Process post: ', lex.procPost(passPhrase))