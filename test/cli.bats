#!/usr/bin/env bats

load '../node_modules/bats-support/load'
load '../node_modules/bats-assert/load'

cli='babel-node ./src/cli.js'

@test "run without arguments" {
  run $cli
  assert_success
  assert_output --regexp '^[[:space:]]+Usage: '
}

@test "--help" {
  run $cli --help
  assert_success
  assert_output --regexp '^[[:space:]]+Usage: '
}

@test "search" {
  run $cli search
  assert_success
  assert_output --regexp '^Searching...'
}

@test "encrypt" {
  run $cli encrypt base64 test
  assert_success
  assert_output '37rJvQ=='
}

@test "encryptWithHeader" {
  run $cli encryptWithHeader base64 test
  assert_success
  assert_output 'AAAABN+6yb0='
}

@test "decrypt" {
  run $cli decrypt base64 37rJvQ==
  assert_success
  assert_output 'test'
}

@test "decryptWithHeader" {
  run $cli decryptWithHeader base64 AAAABN+6yb0=
  assert_success
  assert_output 'test'
}
