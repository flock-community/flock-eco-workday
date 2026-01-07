.PHONY: *

# Standard build, allows for incremental compile and code formatting
build:
	./mvnw verify -Pformat

# Build like a CI: strict, and free of side-effects from previous compilations
ci:
	./mvnw clean verify

# Test the project by running all the tests, or a subset of tests
# Examples:
#		Single test class: make test test_classes=GameResolverTest
#		Multiple test classes: make test test_classes=IdentityContextTest,GamifyApplicationTests
#   All tests: make test
test_classes = ""
test:
	@if [ -z "$(test_classes)" ]; then \
  	echo "\n\n\tRunning ALL tests\n\n"; \
		./mvnw test; \
	else \
	  echo "\n\n\tRunning specific tests $(test_classes)\n\n"; \
		./mvnw test -Dtest='$(test_classes)'; \
	fi

# Clean the project, get rid of all build / target file from compilation
clean:
	./mvnw clean

# Format your codebase, and make it shine. Note that formatting is also part of the 'build' pattern, but this is way quicker
format:
	./mvnw test-compile -Pformat -Denforcer.skip -Djacoco.skip

# Use at your own risk. Get a JAR as quickly as possible, excluding as many validation along the way. Ideal when experimenting or reviewing
yolo :
	./mvnw verify -DskipTests -Denforcer.skip -Dspotless.skip -Djacoco.skip -Pdevelop
