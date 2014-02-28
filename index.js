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
var perPage = 100;

me.orgs(handleOrgs);

function handleOrgs(err, orgs) {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }

  var org = client.org(args.o)
  var page = 1;
  org.repos({page: page, per_page: perPage}, handleRepos);
  var allRepos = [];

  function handleRepos(err, repos) {
    if (err) {
      console.error(err);
      process.exit(1);
      return;
    }
    allRepos = allRepos.concat(repos);
    if (repos.length == perPage) {
      page += 1;
      return org.repos({page: page, per_page: perPage}, handleRepos);
    }

    allRepos.map(handleRepo);
  }
}

function nextPage(){
}


function handleRepo(repoData) {
  var repo = client.repo(repoData.full_name);

  repo.contributors(function(err, contributors){
    var names;
    if (err) {
      console.error('error getting contributors for ' + repoData.name , err);
      names = [];
    }
    else {
      names = _.map((contributors || []).slice(0,10), formatContributor);
    }
    console.log(repoData.name + ', '
                + (repoData.fork ? 'FORK' : 'SOURCE') + ', '
                + repoData.created_at + ', '
                + repoData.pushed_at + ', '
                + repoData.language + ', '
                + names.join(', '));
  });
}

function formatContributor(contributor) {
  return(contributor.login + ', ' + contributor.contributions);
}
