.PHONY: *

## Standard build, allows for incremental compile and code formatting
build:
	./mvnw verify -Pformat

## Build like a CI: strict, and free of side-effects from previous compilations
ci:
	./mvnw clean verify

# Test the project by running all the tests, or a subset of tests
# Examples:
#		Single test class: make test test_classes=GameResolverTest
#		Multiple test classes: make test test_classes=IdentityContextTest,GamifyApplicationTests
#   All tests: make test
test_classes = ""
test: ## Run all backend tests. use 'test test_classes=<className>' for a single test or with a comma separated list of classNames for multiple tests
	@if [ -z "$(test_classes)" ]; then \
  	echo "\n\n\tRunning ALL tests\n\n"; \
		./mvnw test; \
	else \
	  echo "\n\n\tRunning specific tests $(test_classes)\n\n"; \
		./mvnw test -Dtest='$(test_classes)'; \
	fi

## Clean the project, get rid of all build / target file from compilation
clean:
	./mvnw clean

## Format your codebase, and make it shine. Note that formatting is also part of the 'build' pattern, but this is way quicker
format:
	./mvnw test-compile -Pformat -Denforcer.skip -Djacoco.skip

## Use at your own risk. Get a JAR as quickly as possible, excluding as many validation along the way. Ideal when experimenting or reviewing
yolo :
	./mvnw verify -DskipTests -Denforcer.skip -Dspotless.skip -Djacoco.skip -Pdevelop

## Run backend + frontend in Docker and execute Playwright tests, showing only test output
verify:
	@docker-compose down 2>/dev/null || true
	@rm -rf database/
	@docker-compose up -d --wait backend frontend
	@docker-compose run --rm playwright; EXIT_CODE=$$?; docker compose down; exit $$EXIT_CODE



#	 This outputs any command in the Makefile. With a short description taken from a ## prefixed command after the command (preferred) or the line above
#	 ## build the project
#	 build:
#    	<build command>
#
#    yolo: ## quick build of the project - with as little validation as possible
#    	<yolo command>
#
help: ## Show this help

	@echo "Usage: make <command>"; \
	echo ""; \
	desc=""; \
	while IFS= read -r line; do \
		case "$$line" in \
			'## '*)              desc="$${line#\#\# }" ;; \
			[a-zA-Z_-]*:*'## '*) printf '\033[36m%-20s\033[0m %s\n' "$${line%%:*}" "$${line#*\#\# }"; desc="" ;; \
			[a-zA-Z_-]*:*)       printf '\033[36m%-20s\033[0m %s\n' "$${line%%:*}" "$$desc"; desc="" ;; \
			*)                   desc="" ;; \
		esac; \
	done < $(MAKEFILE_LIST) | sort
