setup:
	@npm install

lint:
	@./node_modules/.bin/jshint lib/ test/ --verbose

test: lint
	@./node_modules/.bin/mocha --recursive

watch: lint
	@./node_modules/.bin/mocha --recursive --reporter dot watch
