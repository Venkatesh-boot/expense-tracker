package com.hamsacorp.expense.service;

import com.hamsacorp.expense.model.UserSettings;
import com.hamsacorp.expense.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserSettingsService {

    @Autowired
    private UserSettingsRepository userSettingsRepository;

    public UserSettings getUserSettings(String userEmail) {
        Optional<UserSettings> settings = userSettingsRepository.findByUserEmail(userEmail);
        if (settings.isPresent()) {
            return settings.get();
        } else {
            // Create default settings if not found
            UserSettings defaultSettings = new UserSettings(userEmail);
            return userSettingsRepository.save(defaultSettings);
        }
    }

    public UserSettings updateUserSettings(String userEmail, UserSettings settingsUpdate) {
        UserSettings existingSettings = getUserSettings(userEmail);
        
        if (settingsUpdate.getCurrency() != null) {
            existingSettings.setCurrency(settingsUpdate.getCurrency());
        }
        if (settingsUpdate.getDateFormat() != null) {
            existingSettings.setDateFormat(settingsUpdate.getDateFormat());
        }
        if (settingsUpdate.getMonthlyBudget() != null) {
            existingSettings.setMonthlyBudget(settingsUpdate.getMonthlyBudget());
        }
        
        existingSettings.setUpdatedAt(java.time.LocalDateTime.now());
        return userSettingsRepository.save(existingSettings);
    }

    public void deleteUserSettings(String userEmail) {
        Optional<UserSettings> settings = userSettingsRepository.findByUserEmail(userEmail);
        settings.ifPresent(userSettingsRepository::delete);
    }
}
