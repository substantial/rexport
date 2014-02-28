var fs = require('fs');
var yargs = require('yargs');
var _ = require('lodash');

var opts = yargs
  .options('t', {alias: 'token'})
  .options('s', {alias: 'save-token'})
  .options('o', {alias: 'organization'})
  .usage('Output a CSV-formatted list of the github repos for an organization')
  .describe({
    t: 'a github api token',
    s: 'save the token locally (to ./.token)',
    o: 'the name of the organization'
  });

var args = opts.argv;

if (!(args.o || args.t) || args.o === true) {
  opts.showHelp();
  process.exit(1);
}

var token = args.t;
if (token && args.s) {
  fs.writeFileSync(__dirname + '/.token', args.t);
  console.error('wrote token to ' + __dirname + '/.token');
}

token = token || fs.readFileSync(__dirname + '/.token', 'utf-8').split("\n")[0];

if (!token || token.length == 0) {
  opts.showHelp();
  process.exit(1);
}

if (!args.o)  {
  process.exit();
}

var client = require('octonode').client(token);
var org = client.org(args.o)
var perPage = 100;
var page = 0;
var allRepos = [];

nextRepoPage();

function nextRepoPage() {
  page += 1;
  org.repos({page: page, per_page: perPage}, handleRepos);
}

function handleRepos(err, repos) {
  if (err) {
    console.error(err);
    process.exit(1);
    return;
  }
  allRepos = allRepos.concat(repos);
  if (repos.length == perPage) {
    return nextRepoPage();
  }

  allRepos.map(handleRepo);
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
    var columns = [
      repoData.name,
      (repoData.private ? 'PRIVATE' : 'PUBLIC'),
      (repoData.fork ? 'FORK' : 'SOURCE'),
      formatDate(repoData.created_at),
      formatDate(repoData.pushed_at),
      repoData.language,
      names.join(', ')
    ];
    console.log(columns.join(', '));
  });
}

function formatDate(d) {
  if (d && d.length > 10) return d.substring(0,10);
  return '';
}

function formatContributor(contributor) {
  return(contributor.login + ', ' + contributor.contributions);
}
