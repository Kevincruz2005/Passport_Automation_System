package com.passport.system.controller;

import com.passport.system.model.PoliceVerification;
import com.passport.system.service.PoliceVerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/police-verification")
public class PoliceVerificationController {

    @Autowired
    private PoliceVerificationService policeVerificationService;

    @PostMapping
    public ResponseEntity<?> initiateVerification(@RequestBody Map<String, Object> payload) {
        try {
            Long applicationId = Long.valueOf(payload.get("applicationId").toString());
            String policeStation = payload.get("policeStation").toString();
            return ResponseEntity.ok(policeVerificationService.initiateVerification(applicationId, policeStation));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PoliceVerification>> getPendingVerifications() {
        return ResponseEntity.ok(policeVerificationService.getPendingVerifications());
    }

    @PutMapping("/{id}/report")
    public ResponseEntity<PoliceVerification> submitReport(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String report = payload.get("report");
        return ResponseEntity.ok(policeVerificationService.submitReport(id, report));
    }
}
