# EmeraldScript
:gem: A CLI app of the text based script language for Misskey Pages

## Installation
```
$ npm i -g misskey-em
```
The `em` commands will be available.

Hint: For local installation, you can execute the `em` commands by using `npx`.
```
$ npm i misskey-em
$ npx em login
```

## Syntax of EmeraldScript
comming soon.

Please see a basic example below:  
https://github.com/marihachi/EmeraldScript/tree/master/examples

## Usage
### 1. Log in to Misskey
```
$ em login
```

### 2. Compile your EmeraldScript file
```
$ em build scriptFile.ems scriptFile.page.json
```

### 3. Publish the page file to Misskey
```
$ em publish scriptFile.page.json
```

Enjoy!

## License
MIT
