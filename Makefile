TESTS_ZEMU_DIR?=$(CURDIR)/tests_zemu
TESTS_JS_PACKAGE = "@zondax/ledger-ironfish"
TESTS_JS_DIR = $(CURDIR)/js

.PHONY: build
build:
	cargo ledger build nanosplus


.PHONY: zemu_install_js_link
ifeq ($(TESTS_JS_DIR),)
zemu_install_js_link:
	@echo "No local package defined"
else
zemu_install_js_link:
	# First unlink everything
	cd $(TESTS_JS_DIR) && yarn unlink || true
	cd $(TESTS_ZEMU_DIR) && yarn unlink $(TESTS_JS_PACKAGE) || true
	# Now build and link
	cd $(TESTS_JS_DIR) && yarn install && yarn build && yarn link || true
	cd $(TESTS_ZEMU_DIR) && yarn link $(TESTS_JS_PACKAGE) && yarn install || true
	@echo
	# List linked packages
	@echo
	@cd $(TESTS_ZEMU_DIR) && ( ls -l node_modules ; ls -l node_modules/@* ) | grep ^l || true
	@echo
endif


.PHONY: zemu_install
zemu_install: zemu_install_js_link
	# and now install everything
	cd $(TESTS_ZEMU_DIR) && yarn install


.PHONY: zemu_test
zemu_test:
	cd $(TESTS_ZEMU_DIR) && yarn test