setup:
	@npm install

lint:
	@./node_modules/.bin/jshint lib/ test/ --verbose

test: lint
	@./node_modules/.bin/mocha --recursive

test-coverage:
	@./node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha -- --recursive

# Due to occasional unavailability of the code coverage reporting service, the
# exit status of the command in this recipe may optionally be ignored.
report-coveralls:
	@cat ./coverage/lcov.info | ./node_modules/.bin/coveralls || [ "$(OPTIONAL)" = "true" ]

report-codacy:
	@cat ./coverage/lcov.info | ./node_modules/.bin/codacy-coverage || [ "$(OPTIONAL)" = "true" ]

travis: OPTIONAL = true
travis: lint test-coverage report-coveralls report-codacy
	@true
