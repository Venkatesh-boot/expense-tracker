package com.hamsacorp.expense.service;

import com.hamsacorp.expense.model.User;
import com.hamsacorp.expense.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    private static final SecretKey JWT_SECRET = Keys.hmacShaKeyFor("my-super-secret-key-which-should-be-long-enough-2025".getBytes());
    private static final long JWT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

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

    public String generateJwtToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_EXPIRATION_MS);
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(JWT_SECRET, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims validateJwtToken(String token) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(JWT_SECRET)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
