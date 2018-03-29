let machine = require('./core.js');
// const path = require('path');

const commands = [
  'git clone http://gitlab-cts.stackroute.in',
  'git add .',
  'git commit -am "Adding Files"',
  'git push origin master',
];

const log = effect => console.log(effect);
// const automatonPath = path.resolve(__dirname, './gitAutomaton');

commands.forEach((command) => {
  machine = machine('./gitAutomaton.yml', command, log);
});
