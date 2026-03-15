package com.passport.system.controller;

import com.passport.system.model.PassportApplication;
import com.passport.system.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<PassportApplication> submitApplication(@RequestBody PassportApplication application) {
        return ResponseEntity.ok(applicationService.submitApplication(application));
    }

    @GetMapping
    public ResponseEntity<List<PassportApplication>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PassportApplication> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @GetMapping("/applicant/{applicantID}")
    public ResponseEntity<List<PassportApplication>> getApplicationsByApplicant(@PathVariable Long applicantID) {
        return ResponseEntity.ok(applicationService.getApplicationsByApplicant(applicantID));
    }
}
