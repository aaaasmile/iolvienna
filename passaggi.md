## SQLITE3 e golang
Il modulo fts5 non  funziona di default, come si fa ad averlo?
Si usa questa command line:

    go run --tags "fts5" .\main.go
e per il build:

    go build --tags "fts5" .\main.go


Per quato riguarda la creazione del database con fts5 vedi la descrizione messa nell'importer:
https://github.com/aaaasmile/iol-importer/blob/master/Readme_iol-vienna.txt


## Testa la api del service
Apri una WLC e lancia:
curl -X POST http://localhost:5568/iol/do?req=oca

## SQL
select rowid,text from playsearch where text MATCH "oca"

Poi eseguo la query con i campi di iol_post
select user_name, date_published from playsearch inner join iol_post ON playsearch.playsrowid = iol_post.rowid where playsearch.text MATCH "oca";

Per verdere chi ha scritto più post (primi 20), si usa:
select count(id) as thecount, user_name from iol_post group by user_name ORDER BY thecount DESC LIMIT 20;

Per avere i 10 post seguenti ad una data si usa:
select date_published,id, post_content from iol_post where date_published > '2003-10-31T15:10:00.000Z' ORDER BY date_published  LIMIT(10) ;
Da notare che se si usa > id o post_id non funziona in quanto non hanno una struttura fissa come la data.
Per questa funzione ho creato un indice:
CREATE INDEX idx_iolpost_pubdate ON iol_post(date_published);
Che viene usato nella select di prima:
EXPLAIN QUERY PLAN select date_published,id, post_content from iol_post where date_published > '2003-10-31T15:10:00.000Z' ORDER BY date_published  LIMIT(10) ;
--SEARCH TABLE iol_post USING COVERING INDEX idx_iolpost_pubdate (date_published>?)


Per esempio, per trovare quello che si diceva 10 anni fa:
select date_published,id from iol_post where date_published > '2008-11-20T00:10:00.000Z' AND date_published < '2008-11-20T23:59:00.000Z' ORDER BY date_published  LIMIT(100) ;

## Errori
DB error  no such module: fts5
Questo errore si evita usando l'opzione: --tags "fts5"
Questa sia nel build che nel run. Quindi:
go run --tags "fts5"  .\main.go
go build --tags "fts5"

## Deployment su hetz
Fare attenzione che dist/app.js sia attuale. Su hetz non uso jx ma index_prod.html come template. Quindi:
git pull su ~/build/iolvienna
Poi lanciare lo script ./deploy_app.sh che crea l'app stoppa il service, copia i files e lo rilancia.

## Deploy iniziale su hetz
Copiato il db in ~/app/go/iol-service/db
Ora ho fatto il checkout della repository in ~/app/go/iol-service/ con:
git clone https://github.com/aaaasmile/iolvienna.git
cd ~/build/iolvienna
Qui posso aggiornare la repository con git pull. Una volta pronto per la nuova versione, uso:
go build --tags "fts5"
Poi sposto il file iolvienna in ~/app/go/iol-service/iolvienna.bin. Non dimenticare la dir static, templates e il config.toml
Ora il service è pronto per essere usato dietro ad un nginx (vedi readme_Hetzner.txt).
~/app/go/iol-service/iolvienna.bin
Per stoppare il service:
sudo systemctl stop iolvienna
Lo start invece:
sudo systemctl start iolvienna

## Build dist/app.js
Powershell:
PS D:\scratch\go-lang\iol-vienna\node> npm run build

## React
Come punto di partenza guarda: https://hakaselogs.me/2018-04-20/building-a-web-app-with-go-gin-and-react/
Ho usato index.html come contenitore del mio client sviluppato in react. Index.html l'ho messo come template
per avere la possibilità di gestire del codice via server. Quindi l'app in jsx va a finire sotto la dir
static/js. Babel non va incluso in prod nel file index, ma prima va compilato il file jsx usando per esempio
babel-cli. Come? Sono andato nella dir ../node (D:\scratch\go-lang\iol-vienna\node) ed ho installato babel-cli:
npm install @babel-cli @babel-core 
e tutta una serie di react e babel con la chicocciola. Solo quelli con la chiocciola hanno funzionato (babel ver 0.7).
Guarda il file ../node/package.json per vedere quello che è stato installato e come funziona il comando build.
Ora posso usare 
PS D:\scratch\go-lang\iol-vienna\node> npm run build
Il file .babelrc non serve in quanto uso la cli direttamente dal file package.json.
Il quale esamina la dir static/js e compila in static/dist.
Con il file compilato è possibile rimovere babel da index.html ed usare app.js alla fine del body in index.html.
Con la soluzione che ho adottato, non è possibile usare require '...' in quanto non si ha webpack o simile, 
ma semplicemente il load dei singoli script in index.html. Quindi ho messo tutti i componenti in app.jsx.

## Markdown
Nella mia soluzione non posso usare library come markdown-react-js perché non riesco ad usare il comando import
in quanto non ho nessun builder incorporato come webpack.
Si può usare markdown-it.min.js che ho messo sotto static/js, però in jsx non si mette il codice html generato
nel componente come prop. Si può, ma viene considerato un problema di corss scripting attack anche se funziona(vedi tmp/repo/markdown). 
(Markdown non mi serve, il testo lo edito direttamente in html che si fa prima)

## Lexer
Mi serve un tokenizer per cambiare il formato dei post. Essenzialmente ci sono i \r\n che vanno cambiati con <br \>.
Poi ci sono i link che sonoin formato [dis:linkhttp] che va trasformato in <a href="..">..</a>
Si potrebbe provare con moo (https://github.com/no-context/moo) oppure scrivere un lexer di nuovo come ho fatto in go.
Il lexer l'ho creato manualmente sulla falsa riga di quello creato in go.
Da notare che non si può cambiare semplicemente \r in <br /> in quanto react scrive la stringa in piano
senza convertirla in html. Per avere l'elemnto in html, si usa React.createElement.

## TODO
- invece dei bottoni avanti e indietro, usare lo scroll
- format dei post: manca il break e i link resolve (vedi lexer in appjsx).
- Lexer da finire
- comand id (per esempio :id 853751) [DONE]
- comando :utenti per avere la lista di tutti gli utenti con i loro messaggi [DONE]
- history nel browser delle pagine chiamate, se è possibile. [DONE]

## Problemi
la funzione caso con "Simo '76" non funziona (click sul nome)

## Installare il modulo SQLITE3 in Windows
Col passare del tempo e versioni di go, sembra più difficile installare moduli per windows.
Il modulo per iil database è github.com\mattn\go-sqlite3@v1.14.16
e scondo la homepage su github per installarlo su windows occorre gcc.
Uso MinGW dal TDM.   
Prima di compilare la variabile di sistema deve essere settata:
CGO_ENABLED=1
Per vederla basta usare il comando 
set
Per settarla in MinGW console di TDM si usa:
setx CGO_ENABLED 1
Seguendo poi le istruzioni su github della compilazione su windows:
C:\Users\igors\go\pkg\mod\github.com\mattn\go-sqlite3@v1.14.16>go build ...
Poi ho rilanciato Visual Code con questo progetto usando però lo script powershell
start_code.ps1 che mi setta gcc di TDM nel path. 