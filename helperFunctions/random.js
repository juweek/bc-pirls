/*
------------------------
METHOD: create something for camelCase
------------------------
  */
const exceptions = ["UAE", "SAR"];

function toTitleCase(str) {
  let words = str.split(' ');

  for(let i = 0; i < words.length; i++) {
    if (words[i].startsWith('(') && words[i].endsWith(')')) {
      let subWords = words[i].slice(1, -1).split(' ');
      for (let j = 0; j < subWords.length; j++) {
        subWords[j] = subWords[j][0].toUpperCase() + subWords[j].substr(1).toLowerCase();
      }
      words[i] = '(' + subWords.join(' ') + ')';
    } else if (!exceptions.includes(words[i].toUpperCase())) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
    } else {
      words[i] = words[i].toUpperCase();
    }
  }

  return words.join(' ');
}

export {toTitleCase};

