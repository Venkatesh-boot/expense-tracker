package com.hamsacorp.expense.controller;

import com.hamsacorp.expense.model.User;
import com.hamsacorp.expense.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow CORS for all origins; adjust as needed for security
public class RegistrationController {
  @Autowired
  private AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody User user, BindingResult bindingResult) {
    if (bindingResult.hasErrors()) {
      Map<String, Object> errors = new HashMap<>();
      bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
      return ResponseEntity.badRequest().body(errors);
    }

    String email = user.getEmail();
    String password = user.getPassword();
    String firstName = user.getFirstName();
    String lastName = user.getLastName();
    String countryCode = user.getCountryCode();
    String mobile = user.getMobile();

    Map<String, Object> response = new HashMap<>();
    String error = authService.registerUser(email, password, firstName, lastName, countryCode, mobile);
    if (error != null) {
      response.put("success", false);
      response.put("message", error);
      return ResponseEntity.badRequest().body(response);
    }
    response.put("success", true);
    response.put("message", "Registration successful");
    return ResponseEntity.ok(response);
  }
}
