package com.easychat.app.exception;

import org.modelmapper.internal.bytebuddy.implementation.bind.annotation.Super;

public class PublicKeyAlreadyExistException extends RuntimeException{
    public PublicKeyAlreadyExistException(String username){
        super("Public key already exists for user:" + username);
    }
}
