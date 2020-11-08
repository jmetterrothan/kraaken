import * as firebase from 'firebase';

import 'firebase/firestore';

import config from '@src/config';

const instanceSym = Symbol("firebase-connector");

class FirebaseConnector {
  public app: firebase.app.App;
  public db: firebase.firestore.Firestore;

  private constructor(sym) {
    if (sym !== instanceSym) {
      throw new Error('Could not instanciate FirebaseConnector');
    }

    this.app = firebase.initializeApp({
      apiKey: config.FIREBASE_API_KEY,
      authDomain: config.FIREBASE_AUTH_DOMAIN,
      databaseURL: config.FIREBASE_DATABASE_URL,
      projectId: config.FIREBASE_PROJECT_ID,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
      appId: config.FIREBASE_APP_ID,
    });

    this.db = this.app.firestore();
  }

  public static create(): FirebaseConnector {
    if (!FirebaseConnector[instanceSym]) {
      FirebaseConnector[instanceSym] = new FirebaseConnector(instanceSym);
    }
    return FirebaseConnector[instanceSym];
  }
}

export default FirebaseConnector;
