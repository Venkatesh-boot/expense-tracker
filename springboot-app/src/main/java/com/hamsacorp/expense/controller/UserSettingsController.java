package com.hamsacorp.expense.controller;

import com.hamsacorp.expense.model.UserSettings;
import com.hamsacorp.expense.service.UserSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class UserSettingsController {

    @Autowired
    private UserSettingsService userSettingsService;

    @GetMapping
    public ResponseEntity<UserSettings> getUserSettings(@RequestAttribute("userEmail") String email) {
        try {
            UserSettings settings = userSettingsService.getUserSettings(email);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping
    public ResponseEntity<UserSettings> updateUserSettings(
            @RequestBody UserSettings settingsUpdate,
            @RequestAttribute("userEmail") String email) {
        try {
            UserSettings updatedSettings = userSettingsService.updateUserSettings(email, settingsUpdate);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteUserSettings(@RequestAttribute("userEmail") String email) {
        try {
            userSettingsService.deleteUserSettings(email);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
