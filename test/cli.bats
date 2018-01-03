#!/usr/bin/env bats

@test "run without arguments" {
  run tplink-smarthome-api
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "  Usage: tplink-smarthome-api [options] [command]" ]
}

@test "search" {
  run tplink-smarthome-api search
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "Searching..." ]
}

@test "encrypt" {
  run tplink-smarthome-api encrypt base64 test
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "37rJvQ==" ]
}

@test "encryptWithHeader" {
  run tplink-smarthome-api encryptWithHeader base64 test
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "AAAABN+6yb0=" ]
}

@test "decrypt" {
  run tplink-smarthome-api decrypt base64 37rJvQ==
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "test" ]
}

@test "decryptWithHeader" {
  run tplink-smarthome-api decryptWithHeader base64 AAAABN+6yb0=
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = "test" ]
}
