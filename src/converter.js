const tensify = require('tensify');
const natural = require('natural');


var sentenceTokenizer = new natural.SentenceTokenizer();
var tokenizer = new natural.TreebankWordTokenizer();

// English by default, more languages tbd
const language = "EN";
const defaultCategory = 'N';
const defaultCategoryCapitalized = 'NNP';

var lexicon = new natural.Lexicon(language, defaultCategory, defaultCategoryCapitalized);
var ruleSet = new natural.RuleSet('EN');
var tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

const tagsToMakePast = new Set();
tagsToMakePast.add("VBZ");
tagsToMakePast.add("VBP");
tagsToMakePast.add("VB");

function getSpans(tokens, sentence) {
	// Given a list of tokens, get their spans
	point = 0;
	spans = [];
	for(i in tokens){
		let token = tokens[i];
		try{
			start = sentence.indexOf(token, point);
		} catch (e) {
			throw e;
		}
		point = start + token.length;
		spans.push([start, point]);
	}
	return spans;
}

// Deletes replaces the characters from start to end with the
// insert string
function replaceAt(str, insert, start, end) {
	return str.substring(0, start) + insert + str.substring(end);
}

function makePast(presentText) {
	//let sentences = sentenceTokenizer.tokenize(presentText);

	//console.log(sentences);

	let tokens = tokenizer.tokenize(presentText);
	let spans = getSpans(tokens, presentText);
	//console.log(tokens);

	let taggedWords = tagger.tag(tokens).taggedWords;

	let outputText = presentText;
	// go back to front checking for verbs
	for(let i = taggedWords.length - 1; i>=0; i--){
		let taggedWord = taggedWords[i];

		if(tagsToMakePast.has(taggedWord.tag)) {
			// Make this word past tense
			// TODO: check participleness
			let pastWord = tensify(taggedWord.token).past;
			// replace the word in this span
			let span = spans[i];
			outputText = replaceAt(outputText, pastWord, span[0], span[1]);
		}
	}

	return outputText;
}

exports.makePast = makePast;