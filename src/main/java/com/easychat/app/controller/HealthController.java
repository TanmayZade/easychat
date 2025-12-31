package com.easychat.app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/health")
    public String healthControl(){
        System.out.println("EasyChat is working!");
        return "EasyChat is working!";
    }
}
