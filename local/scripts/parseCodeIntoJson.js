'use strict';

const fs = require('fs');
const glob = require('../node_modules/glob');

glob('notifySms.js', {}, function(er, files) {
  fs.readFile(files[0], 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    let res = {
      'script': data
    }
    console.log(data);
    console.log(JSON.stringify(res));
  });
});


/*

-------------- NODE --------------

{
  "runtime": "node",
  "script":"console.log('\\nHello, world!');\nconsole.log('[Node JS]')\n"
}

{
  "runtime": "node",
  "script": "console.log('\\nHello, world!');\n\nfunction hello() {\n  console.log('[Node JS]');\n}\n\nsetTimeout(hello, 5000);\n"
}

{
  "runtime": "node",
  "taskname": "nodeHello",
  "script": "console.log('\\nHello, world!');\n\nfunction hello() {\n  console.log('[Node JS]');\n}\n\nsetTimeout(hello, 2000);\n"
}

{
  "runtime": "node",
  "taskname": "nodeHello"
}

-------------- GO --------------

{
  "runtime": "go",
  "script":"package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"\\nHello, World!\")\n    fmt.Println(\"[Go]\")\n}\n"
}

{
  "runtime": "go",
  "script":"package main\n\nimport (\n  \"fmt\"\n  \"time\"\n)\n\nfunc main() {\n    fmt.Println(\"\\nHello, World!\")\n    time.Sleep(5000 * time.Millisecond)\n    fmt.Println(\"[Go]\")\n}\n"
}

{
  "runtime": "go",
  "taskname": "goHello",
  "script":"package main\n\nimport (\n  \"fmt\"\n  \"time\"\n)\n\nfunc main() {\n    fmt.Println(\"\\nHello, World!\")\n    time.Sleep(5000 * time.Millisecond)\n    fmt.Println(\"[Go]\")\n}\n"
}

{
  "runtime": "go",
  "taskname": "goHello"
}

-------------- RUBY --------------

{
  "runtime":"ruby",
  "script":"puts \"\\nHello, World!\"\nputs \"[Ruby]\"\n"
}

{
  "runtime":"ruby",
  "script":"puts \"\\nHello, World!\"\nsleep(5)\nputs \"[Ruby]\"\n"
}

{
  "runtime":"ruby",
  "taskname": "helloRuby",
  "script":"puts \"\\nHello, World!\"\nsleep(2)\nputs \"[Ruby]\"\n"
}

{
  "runtime":"ruby",
  "taskname": "helloRuby"
}

*/
