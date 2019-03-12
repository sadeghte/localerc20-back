LocalERC20 express API server
==================================

To see how this things work's see:

- ES6 support via [babel](https://babeljs.io)
- REST resources as middleware via [resource-router-middleware](https://github.com/developit/resource-router-middleware)
- CORS support via [cors](https://github.com/troygoode/node-cors)
- Body Parsing via [body-parser](https://github.com/expressjs/body-parser)
- Database [Mongoose](https://github.com/Automattic/mongoose)



Getting Started
---------------

```sh
# clone it
git clone https://github.com/sadeghte/localerc20-back.git
cd localerc20-back

# Make it your own
rm -rf .git && git init && npm init

# Install dependencies
npm install

# Start development live-reload server
PORT=4000 npm run dev

# Start production server:
PORT=4000 npm start
```

License
-------

MIT
