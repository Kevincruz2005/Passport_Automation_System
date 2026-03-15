package com.passport.system.controller;

import com.passport.system.repository.ApplicationRepository;
import com.passport.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/report")
    public ResponseEntity<Map<String, Object>> getReport() {
        Map<String, Object> report = new HashMap<>();
        
        // Count per status
        Map<String, Long> statusCounts = new HashMap<>();
        applicationRepository.findAll().forEach(app -> {
            String status = app.getStatus() != null ? app.getStatus().name() : "UNKNOWN";
            statusCounts.put(status, statusCounts.getOrDefault(status, 0L) + 1);
        });
        
        report.put("statusCounts", statusCounts);
        report.put("users", userRepository.findAll());
        report.put("totalApplications", applicationRepository.count());
        
        return ResponseEntity.ok(report);
    }
}
