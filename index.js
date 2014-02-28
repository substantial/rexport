var fs = require('fs');
var yargs = require('yargs');
var _ = require('lodash');

var args = yargs
  .options('t', {alias: 'token'})
  .options('s', {alias: 'save-token'})
  .options('o', {alias: 'organization'})
  .argv;

var token = args.t;
if (token && args.s) {
  fs.writeFileSync(__dirname + '/.token', args.t);
}

token = token || fs.readFileSync(__dirname + '/.token', 'utf-8').split("\n")[0];

var client = require('octonode').client(token);
var me = client.me()

me.orgs(handleOrgs);

function handleOrgs(err, orgs) {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }

  var org = client.org(args.o)
  org.repos(handleRepos);
}

function handleRepos(err, repos) {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }

  repos.map(handleRepo);
}

function handleRepo(repo) {
  console.log(repo.name);
}
