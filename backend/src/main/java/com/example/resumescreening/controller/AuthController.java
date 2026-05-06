package com.example.resumescreening.controller;

import com.example.resumescreening.entity.AdminUser;
import com.example.resumescreening.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    // Hardcoded default credentials
    private static final String DEFAULT_USERNAME = "admin";
    private static final String DEFAULT_PASSWORD = "admin123";

    // Secret recovery key — only the admin/developer knows this
    private static final String RECOVERY_KEY = "resume@2026";

    @Autowired
    private AdminUserRepository adminUserRepository;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        // First check if custom credentials exist in the database
        List<AdminUser> admins = adminUserRepository.findAll();
        if (!admins.isEmpty()) {
            AdminUser admin = admins.get(0);
            if (admin.getUsername().equals(username) && admin.getPassword().equals(password)) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "role", "admin",
                        "message", "Login successful"
                ));
            }
        }

        // Fall back to hardcoded defaults (only if no custom credentials in DB)
        if (admins.isEmpty() && DEFAULT_USERNAME.equals(username) && DEFAULT_PASSWORD.equals(password)) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "role", "admin",
                    "message", "Login successful"
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "Invalid username or password"
        ));
    }

    @PostMapping("/reset-credentials")
    public ResponseEntity<Map<String, Object>> resetCredentials(@RequestBody Map<String, String> body) {
        String recoveryKey = body.get("recoveryKey");
        String newUsername = body.get("newUsername");
        String newPassword = body.get("newPassword");

        // Verify recovery key
        if (!RECOVERY_KEY.equals(recoveryKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "Invalid recovery key"
            ));
        }

        if (newUsername == null || newUsername.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Username and password cannot be empty"
            ));
        }

        // Delete any existing admin and save new credentials
        adminUserRepository.deleteAll();
        AdminUser admin = new AdminUser(newUsername.trim(), newPassword.trim());
        adminUserRepository.save(admin);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Credentials updated successfully! You can now log in."
        ));
    }
}
