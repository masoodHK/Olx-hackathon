import auth from "./auth";
import localforage from "localforage";

localforage.setDriver([localforage.INDEXEDDB, localforage.LOCALSTORAGE]);
