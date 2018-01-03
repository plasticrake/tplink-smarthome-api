#!/usr/bin/env bats

load '../node_modules/bats-support/load'
load '../node_modules/bats-assert/load'

@test "run without arguments" {
  run ./lib/cli.js
  assert [ "$status" -eq 0 ]
  assert_success
  assert_output --regexp '^[[:space:]]+Usage: '
}

@test "search" {
  run ./lib/cli.js search
  assert_success
  assert [ "${lines[0]}" = "Searching..." ]
  assert_output --regexp '^Searching...'
}

@test "encrypt" {
  run ./lib/cli.js encrypt base64 test
  assert_success
  assert [ "$status" -eq 0 ]
  assert [ "${lines[0]}" = "37rJvQ==" ]
  assert_output "37rJvQ=="
}

@test "encryptWithHeader" {
  run ./lib/cli.js encryptWithHeader base64 test
  assert_success
  assert [ "$status" -eq 0 ]
  assert [ "${lines[0]}" = "AAAABN+6yb0=" ]
  assert_output 'AAAABN+6yb0='
}

@test "decrypt" {
  run ./lib/cli.js decrypt base64 37rJvQ==
  assert_success
  assert [ "$status" -eq 0 ]
  assert [ "${lines[0]}" = "test" ]
  assert_output 'test'
}

@test "decryptWithHeader" {
  run ./lib/cli.js decryptWithHeader base64 AAAABN+6yb0=
  assert_success
  assert [ "$status" -eq 0 ]
  assert [ "${lines[0]}" = "test" ]
  assert_output 'test'
}
