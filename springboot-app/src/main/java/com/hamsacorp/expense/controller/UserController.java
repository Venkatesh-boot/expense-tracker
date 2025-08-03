package com.hamsacorp.expense.controller;

import com.hamsacorp.expense.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*") // Allow CORS for all origins; adjust as needed for security
public class UserController {
    @Autowired
    private AuthService authService;

    @GetMapping("/exists")
    public ResponseEntity<?> checkUserExists(@RequestParam String email) {
        boolean exists = authService.findByEmail(email) != null;
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
}
