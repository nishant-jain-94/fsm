const R = require('ramda');
const YAML = require('yamljs');

/**
 * Loads the automaton from the given path
 * and returns it as an Object
 * @param {String} path
 * @returns {Object} automaton
 */
const getAutomaton = R.memoize(path => YAML.load(path));

/**
 * Gets all the symbols from the automaton supplied
 * @param {Automaton} automaton
 * @returns {List<String>} symbols
 */
const getSymbols = R.memoize(automaton => automaton.symbols);

/**
 * Finds Symbols matching the input
 * @param {List<String>} symbols
 * @param {String} input
 */
const findMatchingSymbol = R.curry((input, symbols) => symbols.filter(symbol => new RegExp(symbol, 'i').test(input)));

/**
 * Finds the next state based on the current state, symbol and the automaton
 * @param {*} currentState
 * @param {*} symbol
 * @param {*} automaton
 */
const findNextState = R.curry((currentState, symbol, effectCb, automaton) => {
  const nextState = automaton.transitions[currentState][symbol];
  if (automaton.states[nextState].effect) {
    effectCb(automaton.states[nextState].effect);
  }
  return (nextState === automaton.transitions[currentState].epsilon) ?
    findNextState(nextState, 'epsilon', effectCb, automaton) : nextState;
});

/**
 * Transitions from one state to another based on the current
 * state and the symbol in the automaton.
 * @param {*} pathToAutomaton
 * @param {*} currentState
 * @param {*} symbol
 */
const transition = R.curry((pathToAutomaton, currentState, effectCb, symbol) => R.call(R.compose(
  findNextState(currentState, symbol, effectCb),
  getAutomaton,
), pathToAutomaton));

/**
 * @param {Automaton} automaton
 * @param {String} input
 * @param {fn} effectCb
 * @param {String} state (epsilon)
 */
const machine = R.curry((pathToAutomaton, input, effectCb, state = 'EPSILON') => R.call(R.compose(
  nextState => machine(R.__, R.__, R.__, nextState),
  transition(pathToAutomaton, state, effectCb),
  R.head,
  findMatchingSymbol(input),
  getSymbols,
  getAutomaton,
), pathToAutomaton));


module.exports = machine;
