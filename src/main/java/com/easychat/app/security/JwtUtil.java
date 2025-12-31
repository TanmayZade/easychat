package com.easychat.app.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

public class JwtUtil {

    static private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    static private final long  EXPIRATION = (long) 60 * 60 * 1000;

    public static String generateToken(String Username){
        return Jwts
                .builder()
                .setSubject(Username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(key)
                .compact();

    }

    public static String extractUsername(String token){
        return Jwts.parserBuilder()
                .setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }

    public static boolean isValidToken(String token){
        try{
            extractUsername(token);
            return true;
        }catch (JwtException e){
            return false;
        }
    }


}
