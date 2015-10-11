#  Simpex - Simple Expression Parser
Used for showing how to apply variables in strings.  

Say we want to explain
```
mysql -h bob.bob.bob -u bob -p -e 'show full processlist;' > bob.bob
```
Using simpex
```html
<quote>'mysql -h 'host' -u 'user' -p'\. prompt for password.\' -e \'show full processlist;\' > 'filepath</quote>
```
It will show as

![Example](http://common.deemit.com/pkg/simpex/ex1.png)

Using
```javascript
$('quote').simpex()
```

## Install

###  Jquery
Download and include
```html
<script type="text/javascript" src="simpex.js"></script>
<link rel="stylesheet" href="simpex.css" />
<quote>Simpex String</quote>
<script>
  $(function(){
    $('quote').simpex()
  })
</script>
```

### Other
simpex.js can be included in nodejs as a module.  You can use simpex in requirejs (see comment in source).

## Use
### Basic
```html
<quote>Simpex String</quote>
<script>
  $(function(){
    $('quote').simpex()
  })
</script>
```
### Options
Name|Value|Default|Description
---|---|---|---
classMap|{1:string,2:comment}|{0:'simpex_broken', 1:'simpex_string', 2:'simpex_commentLine', 3:'simpex_commentVary', 4:'simpex_variable', 5:'simpex_other'}|A map for what class to apply for each token when formatting the simpex string
formatter|function(){}|exports.formatTokens|The function to use for formatting.  Arg1=tokens, Arg2=options
Example


```javascript
$('quote').simpex({classMap:classMap,formatter:function(tokens,options){console.log(tokens)}})
```
### Available functions
Function|Params|Description
---|---|---
$.fn.simpex.tokeniseStringPattern|string|Makes the tokens
$.fn.simpex.formatter|tokens,options|Does the formatting
$.fn.simpex.format|text,options|Formats a string and returns html
## Syntax Rules
-	Enclose strings in single quotes
-	Use \\.comment.\ to enclose variable length comments
-	Use \ for one line comments
-	Use \ to escape quotes
-	Variables, matching [a-zA-Z_], are anything outside of strings and comments
-	Separate consecutive variables using " between them
-	Newlines, spaces, and tabs are captured in comments string contexts
-	Spaces and tabs are not captured out of string or comment context
-	Newlines are captured out of string and comment context as 'other' tokens

## Misc
The formatter generates a bunch of spans with appropriate classes reflecting the token type.  Here is an example
```html
<quote>var'string'\.variable length comment.\var2'string2'\single line comment
var3 + var4 + var5 + var6"var7'string3''string4'</quote>
```
```html
<quote>
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
</quote>
```