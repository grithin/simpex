///Simpex - simple expression parser
/**
Notes:
	newlines, space, and tabs are captured in comments string contexts
	spaces and tabs are not captured in the 'no-context'/'standard' context
	newlines are captured in the 'no-context'/'standard' as 'other' tokens

Example format
	var'string'\.variable length comment.\var2'string2'\single line comment
	var3 + var4 + var5 + var6"var7'string3''string4'

	results in

	<span class="simpex_variable">var</span>
	<span class="simpex_string">string</span>
	<span class="simpex_commentVary">variable length comment</span>
	<span class="simpex_variable">var2</span>
	<span class="simpex_string">string2</span>
	<span class="simpex_commentLine">single line comment</span>
	<span class="simpex_other"> </span>
	<span class="simpex_variable">var3</span>
	<span class="simpex_other">+</span>
	<span class="simpex_variable">var4</span>
	<span class="simpex_other">+</span>
	<span class="simpex_variable">var5</span>
	<span class="simpex_other">+</span>
	<span class="simpex_variable">var6</span>
	<span class="simpex_variable">var7</span>
	<span class="simpex_string">string3</span>
	<span class="simpex_string">string4</span>

Usage examples
	jquery
		$('quote').simpex()
		$('quote').simpex({classMap:{1:'oner',2:'tw',3:'thr',4:'fo',5:'fi'}})
	requirejs
		requirejs(['brushfire/js/simpex'],function(spdp){
			$('quote').each(function(){
				var tokens = spdp.tokeniseStringPattern($(this).text())
				$(this).html(spdp.formatTokens(tokens))	})	})
*/
/*
How to handle escape slashes
	if in variable comment
		if next character is .
			if next character is \
				final: consider as escape
		final: consider as normal character
	if in string
		if next character is '
			final: consider as escape
		if next character is \
			final: consider as escape
		final: consider as normal character
token types
	0:standard context - non content
	1:string
	2:single line comment
	3:variable length comment
	4:variable
	5:other
*/
(function($){
	var exports = {}
	///compatibility with nodejs
	if(typeof(module)!='undefined'){
		module.exports = exports
	}
	exports.makeTail = function(tokens,addToken){
		token = tokens.pop()
		if(token.text !== ''){
			if(token.type === 0){
				standardTokens = exports.tokeniseStandardContext(token.text)
				if(standardTokens.length > 0){
					tokens.push.apply(tokens,standardTokens)//this is how you use "apply", using self as this parameter, to apply array as parameters to function
				}
			}else{
				tokens.push(token)
			}
		}
		if(addToken){
			tokens.push(addToken)
			return addToken
		}
	}
	exports.tokeniseStandardContext = function(text){
		var current = {type:0}
		var tokens = []
		for(var i = 0, length = text.length; i < length; i++){
			if(text[i] == ' ' || text[i] == "\t"){// || text[i] == "\n" || text[i] == "\r"
				var j = 1+i
				while(j < length && (text[j] == ' ' || text[j] == "\t")){ j+=1 }//fast forward through whitespace
				i = j - 1
				current = {type:0}
				continue
			}
			if(current.type === 0){
				if(/[a-z0-9]/i.test(text[i])){//variable
					current = {type:4,text:text[i]}
					tokens.push(current)
				}else{
					current = {type:5,text:text[i]}
					tokens.push(current)
				}
			}else if(current.type == 4){
				if(/[a-z_0-9]/i.test(text[i])){//variable
					current.text += text[i]
				}else{
					current = {type:5,text:text[i]}
					tokens.push(current)
				}
			}else if(current.type == 5){
				if(/[a-z0-9]/i.test(text[i])){//variable
					current = {type:4,text:text[i]}
					tokens.push(current)
				}else{
					current.text += text[i]
				}
			}
		}
		return tokens
	}


	exports.tokeniseStringPattern = function(text){
		var escaping = false//previous character was '\'
		var current = {type:0,text:''}
		var tokens = [current]
		for(var i = 0, length = text.length; i < length; i++){
			if(current.type === 0){//standard context
				if(text[i] == '\''){
					current = exports.makeTail(tokens,{type:1,text:''})
				}else if(text[i] == '\\'){
					if(text[i+1] == '.'){
						current = exports.makeTail(tokens,{type:3,text:''})
						i += 1
					}else{
						current = exports.makeTail(tokens,{type:2,text:''})
					}
				}else if(text[i] == '"'){//var concatenater
					current = exports.makeTail(tokens,{type:0,text:''})
				}else{
					//handle further inner context parsing later
					current.text += text[i]
				}
			}else if(current.type == 1){//string context
				if(escaping){
					escaping = false
					if(text[i] == '\\' || text[i] == '\''){
						current.text += text[i]
					}else{
						current.text += '\\'+text[i]
					}
				}else{
					if(text[i] == '\\'){
						escaping = true
					}else if(text[i] == '\''){
						current = exports.makeTail(tokens,{type:0,text:''})
					}else {
						current.text += text[i]
					}
				}
			}else if(current.type == 2){//single line comment
				if(text[i] == "\n"){
					current = exports.makeTail(tokens,{type:0,text:''})
				}
				current.text += text[i]
			}else if(current.type == 3){//variable length comment
				if(escaping){
					escaping = false
					if(text[i] == '\\' || text[i] == '.'){
						current.text += text[i]
					}else{
						current.text += '\\'+text[i]
					}
				}else{
					if(text[i] == '\\'){
						escaping = true
					}else if(text[i] == '.' && text[i+1] == '\\'){
						current = exports.makeTail(tokens,{type:0,text:''})
						i += 1
					}else {
						current.text += text[i]
					}
				}
			}
		}
		exports.makeTail(tokens)
		return tokens
	}
	/**
	ex
		$('quote').each(function(){
				var tokens = exports.tokeniseStringPattern($(this).text())
				$(this).html(exports.formatTokens(tokens))
			})
	*/
	exports.formatTokens = function(tokens, classMap){
		var text = ''
		var cssClass
		for(var i in tokens){
			cssClass = classMap[tokens[i].type]
			text += $('<span class="'+cssClass+'"></span>').text(tokens[i].text).wrap('<p>').parent().html()
		}
		return text
	}


	exports.defaults = {
		classMap: {
			0:'simpex_broken',//this should never be present
			1:'simpex_string',
			2:'simpex_commentLine',
			3:'simpex_commentVary',
			4:'simpex_variable',
			5:'simpex_other'},
		formatter: exports.formatTokens	}

	exports.format = function(text, options){
		options = $.extend( {}, $.fn.simpex.defaults, options );
		var tokens = exports.tokeniseStringPattern(text)
		return options.formatter(tokens, options.classMap)
	}

	///compatibility with requirejs
	/*if(typeof(define) != 'undefined'){
		define(exports)
	}*/
	///as a jquery extension
	if($){
		$.fn.simpex = function(options){
			options = $.extend( {}, $.fn.simpex.defaults, options );
			return this.each(function(){
				var tokens = exports.tokeniseStringPattern($(this).text())
				$(this).html(options.formatter(tokens, options.classMap))	})	}
		$.extend($.fn.simpex, exports);
	}
})((typeof(jQuery) != 'undefined' && jQuery) || false)