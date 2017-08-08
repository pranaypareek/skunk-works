'use strict';

const fs = require('fs');

fs.readFile('hello.js', 'utf8', function(err, data) {
  if (err) {
    return console.log(err);
  }
  let res = {
    'script': data
  }
  console.log(JSON.stringify(res));
});

/*

{
  "runtime": "node",
  "script":"console.log('\\nHello, world!');\nconsole.log('[Node JS]')\n"
}

{
  "runtime": "node",
  "script": "console.log('\\nHello, world!');\n\nfunction hello() {\n  console.log('[Node JS]');\n}\n\nsetTimeout(hello, 5000);\n"
}

{
  "runtime": "go",
  "script":"package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"\\nHello, World!\")\n    fmt.Println(\"[Go]\")\n}\n"
}

{
  "runtime":"ruby",
  "script":"puts \"\\nHello, World!\"\nputs \"[Ruby]\"\n"
}

*/
