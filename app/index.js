'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var shell = require('shelljs');
var chalk = require('chalk');


var MicrositeAssembleGenerator = module.exports = function MicrositeAssembleGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.skipInstall = options['skip-install'];

  this.on('end', function () {
    this.installDependencies({ skipInstall: this.skipInstall });

    console.log('Microsite generator finished. Run ' + chalk.yellow.bold('grunt dev') + ' to start dev server.');
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(MicrositeAssembleGenerator, yeoman.generators.Base);

MicrositeAssembleGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  var prompts = [{
    name: 'siteName',
    message: 'What is the name of the microsite?',
  }];

  this.prompt(prompts, function (props) {
    this.siteName = props.siteName;

    cb();
  }.bind(this));
};

MicrositeAssembleGenerator.prototype.app = function app() {
  this.mkdir('cms');
  this.mkdir('static');
  this.mkdir('static/img');

  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');

  this.copy('Gruntfile.js', 'Gruntfile.js');
  this.copy('cpanfile', 'cpanfile');

  this.directory('bin', 'bin');
  this.directory('cms', 'cms');

  this.directory('src/js', 'src/js');
  this.directory('src/less', 'src/less');
  this.copy('static/img/close.png', 'static/img/close.png');
  this.directory('templates', 'templates');
  this.directory('fragments', 'fragments');

};

MicrositeAssembleGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
  this.copy('gitignore', '.gitignore');
};

MicrositeAssembleGenerator.prototype.perldeps = function perldeps() {
  if (this.skipInstall) {
    console.log('\nRun ' + chalk.yellow.bold('carton install') + ' to install perl dependencies.');
    return;
  }

  var code = shell.exec('carton install').code;
  if (code) {
    throw new Error('carton install failed.');
  }
};

