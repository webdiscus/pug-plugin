# Manual test webpack serv

Test the rebuild after changes by webpack serv or watch.

## Test for fixed issue
After changes the resources will be rebuild. In console output expected `on page Home -> Home`, but received `on page Home -> About`.

## Install
```
npm i
```

## Test in browser

1. Start webpack devel server
  ```
  npm run start
  ```
2. Open console in browser
3. Click on a link, eg. `home`
4. Change any file, e.g. `src/page/home/index.js`, `src/page/home/index.js`
5. In browser console expected following output:
   - on page Home -> `Home`
   - on page About -> `About`