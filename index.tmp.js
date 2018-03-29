const YAML = require('yamljs');
const R = require('ramada');
const EventEmitter = require('events');
const gitAutomaton = YAML.load('./gitAutomaton.yml');

const commands = [
	"git clone http://gitlab-cts.stackroute.in",
	"git add .",
	'git commit -am "Adding Files"',
	"git clone",
];

const getEventEmitter = () => R.memoize(() => new events.EventEmitter());

const emitEffects = R.curry((effect, emitter) => emitter.emit('effect', effect));

const produceEffect = R.ifElse(
	R.compose(R.not, R.nil),
	R.compose(emitEffects, getEventEmitter),
);

const testInputAgainstSymbol = (input, symbol) => new RegExp(symbol, "i").test(input);

const findMatchingSymbol = (symbols, input) =>
	symbols.filter(symbol => testInputAgainstSymbol.bind(null, input))

const findNextState = (automaton, input, currentState) => {
	const [transitionSymbol] = automaton.symbols.filter(symbol => {
		const re = new RegExp(symbol, "i");
		return re.test(input);
	});
	const state = stateTransitions[transitionSymbol];
	return stateTransitions[transitionSymbol];
};

const transition = (automaton, state, input) => {
	produceEffect(automaton.states[state].effect);
	let nextState = findNextState(automaton, input);
	if (nextState === automaton.transitions[nextState].epsilon) {
		return nextState;
	} else {
		transition(automaton, state, 'epsilon');
	}
};

const machine = (automaton, command, currentState=automaton.start_state[0]) => {
	if (commands.length) {
		const [input, ...rest] = commands;
		const nextState = transition(automaton, currentState, input);
		return machine(automaton, rest, nextState);
	}
};

machine(gitAutomaton, commands);
