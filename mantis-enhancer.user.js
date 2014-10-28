// ==UserScript==
// @name         Mantis Enhancer
// @namespace    http://flopp.net/
// @version      0.2.3
// @description  Several enhancements for Mantis BT
// @author       Florian Pigorsch
// @downloadURL  https://raw.githubusercontent.com/flopp/mantis-enhancer-user-script/master/mantis-enhancer.user.js
// @updateURL    https://raw.githubusercontent.com/flopp/mantis-enhancer-user-script/master/mantis-enhancer.user.js
// @match        *://*/bug_report_page.php
// @match        *://*/bug_update_page.php
// @match        *://*/view.php?id=*
// @match        *://*/bugnote_edit_page.php?bugnote_id=*
// @match        *://*/account_prof_menu_page.php
// @grant        none
// ==/UserScript==


function loadStylesheet(url)
{
    var head = document.getElementsByTagName('head')[0]; 
    if (!head) { return; }
    
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', url);
    head.appendChild(link);
}


function addGlobalStyle(css) 
{
    var head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

function insertTag(textAreaId, tag)
{    
    return function(){
        var textArea = document.getElementById(textAreaId);
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;
        var selection = textArea.value.substring(start, end);
        
        var insertText = "<" + tag + ">"+selection+"</" + tag + ">";
        textArea.value = textArea.value.substr(0, start) + insertText + textArea.value.substr(end, textArea.value.length);
        
        if (selection.length == 0){
            textArea.selectionStart = start + tag.length + 2;
            textArea.selectionEnd = start + tag.length + 2;
        } else {
            textArea.selectionStart = start + (tag.length + 2);
            textArea.selectionEnd = start + (tag.length + 2) + selection.length;
        }
        textArea.focus();
    };
}


function insertListTags(textAreaId, tag)
{    
    return function(){
        var textArea = document.getElementById(textAreaId);
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;
        var selection = textArea.value.substring(start, end);
        
        var insertText = '<' + tag + '>';
        var lines = selection.split(/^\s*|\s*\n\s*|\s*$/).filter(function(v) { return v != ''; });
        
        if (lines.length == 0)
        {
            insertText += '\n<li></li>';
        }
        else
        {
            insertText += lines.map(function(v) { return '\n<li>' + v + '</li>'; }).join('');
        }
        insertText += '\n</' + tag + '>';
        
        textArea.value = textArea.value.substr(0, start) + insertText + textArea.value.substr(end, textArea.value.length);
        
        textArea.focus();
    };
}


function indentLine(line, depth)
{
  if (depth >= 0)
  {
    for (var i = 0; i != depth; ++i)
    {
      line = ' ' + line;
    }
  }
  else 
  {
    while (depth < 0)
    {
      if (line.indexOf(' ') == 0)
      {
        line = line.substr(1, line.length - 1);
      }
      ++depth;
    }
  }
  
  return line;
}


function indent(textAreaId, depth)
{
    return function(){
        var textArea = document.getElementById(textAreaId);
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;
        while (start > 0 && textArea.value[start] != '\n')
        {
          start = start - 1;
        }
        var selection = textArea.value.substring(start, end);
        
        var lines = selection.split('\n');
        for (var i = 0; i != lines.length; ++i)
        {
          lines[i] = indentLine(line, depth);
        }
        
        var insertText = lines.join('\n');
        textArea.value = textArea.value.substr(0, start) + insertText + textArea.value.substr(end, textArea.value.length);
        textArea.focus();
      };
}


function createButton(icon, tooltip, buttonFunction)
{
    var i = document.createElement('i');
    i.setAttribute('class', 'fa fa-' + icon);
    
    var b = document.createElement('div');
    b.setAttribute('class', 'button');
    b.setAttribute('title', tooltip);
    b.appendChild(i);
    b.addEventListener('click', buttonFunction, false);
    
    return b;
}


function addTextAreaButtons()
{
    var textAreas = document.getElementsByTagName('textarea');
    for (var i = 0; i != textAreas.length; ++i)
    {
        var textArea = textAreas[i];
        var textAreaId = 'textarea_' + i;
        textArea.setAttribute('id', textAreaId);
        var parent = textArea.parentNode;
        
        var buttonArea = document.createElement('div');
        buttonArea.setAttribute('class', 'button-area');
        parent.insertBefore(buttonArea, textArea);
        
        var formatGroup = document.createElement('div');
        formatGroup.setAttribute('class', 'button-group');
        buttonArea.appendChild(formatGroup);
        formatGroup.appendChild(createButton('bold', 'bold text', insertTag(textAreaId, 'b')));
        formatGroup.appendChild(createButton('italic', 'italic text', insertTag(textAreaId, 'i')));
        formatGroup.appendChild(createButton('underline', 'underlined text', insertTag(textAreaId, 'u')));
        formatGroup.appendChild(createButton('strikethrough', 'strike-out text', insertTag(textAreaId, 's')));
        formatGroup.appendChild(createButton('code', 'pre-formatted text (for code)', insertTag(textAreaId, 'pre')));
        
        var listGroup = document.createElement('div');
        listGroup.setAttribute('class', 'button-group');
        buttonArea.appendChild(listGroup);
        listGroup.appendChild(createButton('list-ul', 'unordered list', insertListTags(textAreaId, 'ul')));
        listGroup.appendChild(createButton('list-ol', 'ordered list', insertListTags(textAreaId, 'ol')));
        listGroup.appendChild(createButton('minus', 'list item', insertTag(textAreaId, 'li')));
        
        var indentGroup = document.createElement('div');
        indentGroup.setAttribute('class', 'button-group');
        buttonArea.appendChild(indentGroup);
        indentGroup.appendChild(createButton('indent', 'indent lines', indent(textAreaId, 2)));
        indentGroup.appendChild(createButton('outdent', 'outdent lines', indent(textAreaId, -2)));
    }
}

loadStylesheet('http://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css');
addGlobalStyle('textarea { width: 100% !important; }');
addGlobalStyle('.button-area { width: 100%; }');
addGlobalStyle('.button-area .button-group { display: inline-block; margin-right: 4px; }');
addGlobalStyle('.button-area .button-group .button { padding: 8px 12px; border: 1px solid transparent; border-radius: 4px; margin-right: 2px; background-color: #428bca; color: white; display: inline-block; cursor: pointer; }');
addTextAreaButtons();
