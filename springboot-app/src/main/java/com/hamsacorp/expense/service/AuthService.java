package com.hamsacorp.expense.service;

import com.hamsacorp.expense.model.User;
import com.hamsacorp.expense.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    public String registerUser(String email, String password, String firstName, String lastName, String countryCode, String mobile) {
        if (email == null || password == null) {
            return "Email and password are required";
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return "Email already registered";
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(password); // In production, hash the password!
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setCountryCode(countryCode);
        user.setMobile(mobile);
        userRepository.save(user);
        return null; // null means success
    }

    public boolean authenticate(String email, String password) {
        return userRepository.findByEmail(email)
                .map(user -> user.getPassword().equals(password))
                .orElse(false);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}
