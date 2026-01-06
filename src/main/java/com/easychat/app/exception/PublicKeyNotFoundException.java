package com.easychat.app.exception;



public class PublicKeyNotFoundException extends RuntimeException{
    public PublicKeyNotFoundException(String username){
        super("Public Key not found for user: " + username);
    }
}
