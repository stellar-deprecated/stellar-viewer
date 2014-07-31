Stellar Viewer
==============
This is a simple tool that shows the balance, trust lines and offers of any specified user on the Stellar network. It is an AngularJS application that uses [WebSockets](https://developer.mozilla.org/en-US/docs/WebSockets) to communicate with a [Stellar daemon](https://github.com/stellar/stellard).

You can see an example of this in action at https://www.stellar.org/viewer/

## Features
- Basic account info lookup (balance, trust lines, offers)
- Can view accounts on either the testnet or livenet
- Ability to resolve addresses from federated names

## Usage
This app will not work locally because AngularJS needs to load template files through http.

### Option 1: Use your own web server
If you have your own web server set up, simply serve these files and open up index.html on your browser.

### Option 2: Use a simple NodeJS server such as [http-server](https://www.npmjs.org/package/http-server)
```bash
# Install npm if you haven't already
curl https://npmjs.org/install.sh | sh

# Install http-server, a zero-configuration command-line http server
npm install http-server -g

# Run the server
http-server
```

Open up http://localhost:8080 in your browser.
