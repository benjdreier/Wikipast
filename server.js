const express = require('express');
const http = require('http');
const https = require('https');
const conv = require('./src/converter');
const rp = require('request-promise');
const querystring = require('querystring');
const cheerio = require('cheerio');
var path = require('path');

var public = path.join(__dirname, 'public');
const app = express();
app.use("/public", express.static(__dirname + '/public'));

//initialize a simple http server
const server = http.createServer(app);

app.get('/', (req, res) => {
	res.sendFile(path.join(public, 'index.html'));
})

app.get('/wiki/Wikipedia:About/', (req, res) => {
	res.redirect("/about/");
})

app.get('/wiki/:articleTitle', (req, res) => {
	let { articleTitle } = req.params;

	const url = `https://en.wikipedia.org/wiki/${articleTitle}`;
	rp(url).then((html) => {
		let out = processHtml(html);
		res.send(out);
	})
	.catch(error => {
		// 404 Error
		res.send("404 Not Found");
		throw error;
	});
})

app.get('/w/load.php', (req, res) => {
	const query = querystring.stringify(req.query);

	const url = "https://en.wikipedia.org/w/load.php?" + query;
	rp(url)
	.then((thing) => {
		res.writeHead(200, {'Content-type' : 'text/css'});
		res.write(thing);
		res.end();
	})
})

const blacklist = new Set()
blacklist.add("Special:UserLogin");
blacklist.add("Special:CreateAccount");

app.get('/w/index.php', (req, res) => {
	const query = querystring.stringify(req.query);
	const url = "https://en.wikipedia.org/w/index.php?" + query;

	console.log(req.query);
	if(!req.query.action && !blacklist.has(req.query.title)){
		rp({ uri: url, resolveWithFullResponse: true })
		.then((resp) => {
			let redirectPath = resp.request.uri.path;

			if(resp.request.uri.href == url){
				res.send(resp.body);
			}
			else {
				res.redirect(redirectPath);
			}
		})
	}
	else{
		// This index page isn't allowed. redirect somewhere.
		res.redirect("/about");
	}
})

app.get('/about/', (req, res) => {
	res.send("ABOUT PAGE COMING SOON");
})

app.get('*', (req, res) => {
	res.redirect("/about");
})

function replacer($, text, f) {
  let constituents = $(text).contents();
  if (constituents.length) {
    constituents.each(function(i, el) {
	  if(el.type == 'text'){
    	el.data = f(el.data);
      }
      else{
      	return replacer($, $(el), f);
      }
    });
  } else {
    var value = $(text).text();
    value = f(value);
    
    $(text).text(value)
    return;
  }
}


function processHtml(html) {
	// Process html, make past tense and otehr mods
	const $ = cheerio.load(html);

	let articleContent = $("#mw-content-text");
	let paragraphs = articleContent.find("p");
	let lists = articleContent.find("ul");

	// Now we past-tensify
	paragraphs.map((i, el) => {
		replacer($, el, conv.makePast);
	});

	lists.each((i, el) => {
		replacer($, el, conv.makePast);
	});

	// Replace the Wikipedia logo
	//const logo_url = "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg";
	const logo_url = "/public/wikipast.png";
	$("#p-logo a").css("background-image", `url(${logo_url})`);

	return $.html();
}

//start our server
server.listen(process.env.PORT || 8080, () => {
    console.log('Server started on port ' + server.address().port + ' :)');
});