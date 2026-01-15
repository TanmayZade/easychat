package com.easychat.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
public class EmailService {

    @Value("${mailjet.api-key}")
    private String apiKey;

    @Value("${mailjet.secret-key}")
    private String secretKey;

    @Value("${app.base-url}")
    private String baseUrl;

    private static final String MAILJET_URL =
            "https://api.mailjet.com/v3.1/send";

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendVerificationEmail(String toEmail, String token) {

        String verifyLink = baseUrl +
                "/easychat/api/auth/verify?token=" + token;

        // ✅ FULLY VALID Mailjet payload (TextPart is IMPORTANT)
        Map<String, Object> payload = Map.of(
                "Messages", new Object[]{
                        Map.of(
                                "From", Map.of(
                                        "Email", "easychat148@gmail.com", // MUST be verified in Mailjet
                                        "Name", "EasyChat"
                                ),
                                "To", new Object[]{
                                        Map.of(
                                                "Email", toEmail,
                                                "Name", "User"
                                        )
                                },
                                "Subject", "Verify your email",
                                "TextPart",
                                "Welcome to EasyChat!\n\n" +
                                        "Please verify your email using the link below:\n" +
                                        verifyLink + "\n\n" +
                                        "This link expires in 30 minutes.",
                                "HTMLPart",
                                "<h3>Welcome to EasyChat 👋</h3>" +
                                        "<p>Please verify your email:</p>" +
                                        "<p><a href='" + verifyLink + "'>Verify Email</a></p>" +
                                        "<p>If the button doesn't work, copy this link:</p>" +
                                        "<p>" + verifyLink + "</p>" +
                                        "<p><strong>This link expires in 30 minutes.</strong></p>"
                        )
                }
        );

        // 🔐 Basic Auth
        String auth = apiKey + ":" + secretKey;
        String encodedAuth = Base64.getEncoder()
                .encodeToString(auth.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(MediaType.parseMediaTypes("application/json"));
        headers.set("Authorization", "Basic " + encodedAuth);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(payload, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(
                        MAILJET_URL,
                        request,
                        String.class
                );

        // 🔎 CRITICAL: Mailjet errors are often inside body
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException(
                    "Mailjet HTTP error: " + response.getStatusCode()
            );
        }

        // Optional but HIGHLY recommended during testing
        System.out.println("Mailjet response: " + response.getBody());
    }
}
