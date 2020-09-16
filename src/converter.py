import nltk
from nltk.tokenize.treebank import TreebankWordDetokenizer
from nltk.tokenize.treebank import TreebankWordTokenizer

def makePastTense(presentText):
	words = TreebankWordTokenizer().tokenize(presentText)
	tagged_words = nltk.pos_tag(words)
	print(tagged_words)

	output = TreebankWordDetokenizer().detokenize(words)
	print(output)

# todo: deal with ipa/non-ascii characters
sampleText = "Jeffrey Preston Bezos is an American internet entrepreneur, industrialist, media proprietor, and investor. He is best known as the founder, CEO, and president of the multi-national technology company Amazon. The first centi-billionaire on the Forbes wealth index, Bezos has been the world's richest person since 2017 and was named the \"richest man in modern history\" after his net worth increased to $150 billion in July 2018.[3] According to Forbes, Bezos is the first person in history to have a net worth exceeding $200 billion.[4]"

#nltk.download('averaged_perceptron_tagger')
makePastTense(sampleText)