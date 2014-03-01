## rexport

A very quick and dirty tool that exports all of the github repositories in an organization to a CSV format suitable for spreadsheets.

## usage

Get a token from https://github.com/settings/applications. It should have admin:org and repo permissions.


Generate the CSV:

```rexport --token {TOKEN} --organization {ORGANIZATION}```

Save the token locally:

```rexport --token {TOKEN} --save-token```
