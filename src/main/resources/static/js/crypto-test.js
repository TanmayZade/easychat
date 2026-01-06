import {
    ensureECCKeys, getUsernameFromJWT,
    loadKey
} from "./crypto.js";


async function abToB64(buf){
    return btoa(String.fromCharCode(... new Uint8Array(buf)));
}

async function b64ToAb(b64){
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
}

async function runE3Test(receiverUsername) {
    console.log("=== E3 CRYPTO TEST START ===");

    // Ensure local ECC keys exist
    await ensureECCKeys();

    // CHECK 3 — Fetch receiver public key
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("JWT not found. Login first.");
    }else{
        console.log("JWT passed successfully");
    }

    const res = await fetch(`/easychat/api/keys/${receiverUsername}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch public key (${res.status})`);
    }

    const data = await res.json();
    const jwk = data.publicKey;

    console.log("Receiver JWK:", jwk);

    // CHECK 3.2 — Import receiver public key
    const importedKey = await crypto.subtle.importKey(
        "jwk",jwk,
        {name:"ECDH", namedCurve:"P-256"},
        true,
        []
    );

    console.log("Receivers public key:" + importedKey);
    console.log("Public key type:", importedKey.type);
    console.log("Public key algorithm:", importedKey.algorithm);
    console.log("Public key extractable:", importedKey.extractable);
    console.log("Public key usages:", importedKey.usages);

    const username = getUsernameFromJWT();

    //Check 4.1 - Importing our own private key
    const privateKey = await loadKey(   `privateKey:${username}`)
    if(!privateKey){
        throw new Error("Private key not found in IndexedDB");
    }

    console.log("Our private key "+ privateKey);
    console.log("Private key type:", privateKey.type);
    console.log("Private key algorithm:", privateKey.algorithm);
    console.log("Private key extractable:", privateKey.extractable);
    console.log("Private key usages:", privateKey.usages);

    //check 4.2 - deriving AES key
    const aesKey = await crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: importedKey
        },privateKey,
        {
            name: "AES-GCM",
            length: 256
        },false,
        ["encrypt","decrypt"]
    );

    console.log("Derived AES KEY is "+ aesKey);
    console.log("Our aesKey key "+ aesKey);
    console.log("aesKey key type:", aesKey.type);
    console.log("aesKey key algorithm:", aesKey.algorithm);
    console.log("aesKey key extractable:", aesKey.extractable);
    console.log("aesKey key usages:", aesKey.usages);

    //check 5 performing encryption and descryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plainText = "tanmay";
    console.log("Plain text we inserted: " + plainText);
    const encoded = new TextEncoder().encode(plainText);
    console.log("Text after encoding: "+ encoded);

    const cipherText =await crypto.subtle.encrypt(
        {name:"AES-GCM",
            iv},
        aesKey,
        encoded
    );
    console.log("Text after encrypting: "+ cipherText);
    console.log(new Uint8Array(cipherText));

    const decrypted =await crypto.subtle.decrypt(
        {name:"AES-GCM",
        iv},
        aesKey,
        cipherText
    );
    console.log("Text after decrypting: "+ decrypted);
    console.log(new Uint8Array(decrypted));

    const result = new TextDecoder().decode(decrypted);
    if(result !== plainText ){
        throw new Error("Text mismatched");
    }
    console.log("Text after decoding decrypted text: "+ result);


}

// Expose ONLY for this test page
window.runE3Test = runE3Test;
