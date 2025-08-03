package com.hamsacorp.expense.controller;

import com.hamsacorp.expense.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow CORS for all origins; adjust as needed for security
public class LoginController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        boolean authenticated = authService.authenticate(username, password);
        Map<String, Object> response = new HashMap<>();
        response.put("success", authenticated);
        if (authenticated) {
            response.put("message", "Login successful");
        } else {
            response.put("message", "Invalid username or password");
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public String test() {
        return "Login API is working!";
    }
}
