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
https://github.com/marihachi/EmeraldScript/blob/master/example1.ems

## Usage
### 1. Log in to Misskey
```
$ em login
```

### 2. Compile your EmeraldScript file
```
$ em build scriptFile.ems scriptFile.ai.json
```

### 3. Publish the page to Misskey
```
$ em publish scriptFile.ai.json
```

Enjoy!

## License
MIT
