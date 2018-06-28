import auth from "./auth";

const localForage = require("localforage");
localForage.setDriver([localForage.INDEXEDDB, localForage.LOCALSTORAGE]);
console.log(localForage);
auth();
