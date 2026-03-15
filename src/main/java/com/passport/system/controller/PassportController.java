package com.passport.system.controller;

import com.passport.system.model.Passport;
import com.passport.system.model.PassportApplication;
import com.passport.system.service.PassportIssuanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/passport")
public class PassportController {

    @Autowired
    private PassportIssuanceService passportIssuanceService;

    @PostMapping("/approve/{applicationID}")
    public ResponseEntity<?> approveApplication(@PathVariable Long applicationID) {
        try {
            PassportApplication app = passportIssuanceService.approveApplication(applicationID);
            return ResponseEntity.ok(app);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/issue/{applicationID}")
    public ResponseEntity<?> issuePassport(@PathVariable Long applicationID) {
        try {
            Passport passport = passportIssuanceService.issuePassport(applicationID);
            return ResponseEntity.ok(passport);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{applicationID}")
    public ResponseEntity<?> getPassport(@PathVariable Long applicationID) {
        return passportIssuanceService.getPassportByApplication(applicationID)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
