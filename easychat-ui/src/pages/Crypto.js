import API_BASE from "../config/api";

const DB_NAME = "easychat-crypto";
const STORE = "keys";
console.log("crypto.js loaded");



async function abToB64(buf){
    return btoa(String.fromCharCode(... new Uint8Array(buf)));
}

async function b64ToAb(b64){
    return  Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
}

export async function getReceiverPublicKey(username){
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/easychat/api/keys/${username}`,{
        headers : {            "Content-Type": "application/json",
            "Authorization" : "Bearer " + token}
    });

    const data =await res.json();

    return crypto.subtle.importKey(
        "jwk",
        data.publicKey,
        {name : "ECDH", namedCurve: "P-256"},
        true,
        []
    );
}

export async function deriveAESKey(recPublicKey){
    const username = getUsernameFromJWT();
    const myPrivateKey = await loadKey(`privateKey:${username}`);

    return crypto.subtle.deriveKey(
        { name: "ECDH", public: recPublicKey },
        myPrivateKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export async function encryptMessage(plainText, AESKey){
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(plainText);

    const cipherText =await crypto.subtle.encrypt(
        {name:"AES-GCM",iv},
        AESKey,
        encodedText
    )

    return {
        cipherText:await abToB64(cipherText),
        iv:await abToB64(iv)
    };
}

export async function decryptMessage(cipherTextB64, ivB64, AESKey){
    const cipherBuf =await b64ToAb(cipherTextB64);
    const iv = new Uint8Array( await b64ToAb((ivB64)));


    const plainBuf = await crypto.subtle.decrypt(
        {name:"AES-GCM",iv},
        AESKey,
        cipherBuf
    );

    return new TextDecoder().decode(plainBuf);
}
function openDB(){
    return new Promise((resolve) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            req.result.createObjectStore(STORE);
        };
        req.onsuccess = () => (resolve(req.result));
    });
}

async function saveKey(name, key){
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(key, name);

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function loadKey(name){
    const db = await openDB();
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);

    return new Promise((resolve,reject) =>{
        const req = store.get(name);
        req.onsuccess = () => (resolve(req.result));
        req.onerror = () => (reject(req.error));
    });
}

export function getUsernameFromJWT() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const payloadBase64 = token.split(".")[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(payloadJson);

        return payload.sub;
    } catch {
        return null;
    }

export async function ensureECCKeys() {
    const username = getUsernameFromJWT();

    const privateKey = await loadKey(`privateKey:${username}`);
    const publicKey  = await loadKey(`publicKey:${username}`);

    if (privateKey && publicKey) {
        console.log("ECC keys already exist");
        return;
    }

    const keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        ["deriveKey"]
    );

    await saveKey(`publicKey:${username}`, keyPair.publicKey);
    await saveKey(`privateKey:${username}`, keyPair.privateKey);

    console.log("ECC pair generated and stored successfully");
}


export async function uploadPublicKey() {
    const username = getUsernameFromJWT();
    const flagKey = `publicKeyUploaded:${username}`;

    if (localStorage.getItem(flagKey) === "true") {
        return;
    }

    const publicKey = await loadKey(`publicKey:${username}`);

    if (!publicKey) {
        console.error("❌ Public key not found in IndexedDB");
        return;
    }

    const jwk = await crypto.subtle.exportKey("jwk", publicKey);

    const token = localStorage.getItem("token");
    if (!token) throw new Error("JWT not found");
    localStorage.setItem(flagKey, "true");
    const res = await fetch(`${API_BASE}/easychat/api/keys/upload`,{
        method: "POST",
        headers:{
            "Authorization" : "Bearer " + token,
            "Content-Type" : "application/json"
        },
        body:JSON.stringify({publicKey: jwk})
    });
    // localStorage.setItem(flagKey, "true");
    if (res.status === 409) {
        console.log("Public key already registered — continuing");
        localStorage.setItem(flagKey, "true");

        return;
    }

    if (!res.ok) {
        const text = await res.text();
            localStorage.removeItem(flagKey);

        throw new Error("Key upload failed: " + text);
    }

    console.log("Public key uploaded to server");

    }
}