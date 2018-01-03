#!/usr/bin/env bats

@test "run without arguments" {
  run ./lib/cli.js
  [ "$status" -eq 0 ]
  [[ "${lines[0]}" = "  Usage: "* ]]
}

@test "search" {
  run ./lib/cli.js search
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "Searching..." ]
}

@test "encrypt" {
  run ./lib/cli.js encrypt base64 test
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "37rJvQ==" ]
}

@test "encryptWithHeader" {
  run ./lib/cli.js encryptWithHeader base64 test
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "AAAABN+6yb0=" ]
}

@test "decrypt" {
  run ./lib/cli.js decrypt base64 37rJvQ==
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "test" ]
}

@test "decryptWithHeader" {
  run ./lib/cli.js decryptWithHeader base64 AAAABN+6yb0=
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "test" ]
}
