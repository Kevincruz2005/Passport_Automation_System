package com.passport.system.service;

import com.passport.system.model.ApplicationStatus;
import com.passport.system.model.PassportApplication;
import com.passport.system.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    public PassportApplication submitApplication(PassportApplication application) {
        application.setApplicationDate(LocalDateTime.now());
        application.setStatus(ApplicationStatus.SUBMITTED);
        return applicationRepository.save(application);
    }

    public List<PassportApplication> getApplicationsByApplicant(Long applicantId) {
        return applicationRepository.findByApplicant_UserID(applicantId);
    }

    public List<PassportApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    public PassportApplication getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public PassportApplication updateStatus(Long id, ApplicationStatus status) {
        PassportApplication app = getApplicationById(id);
        app.setStatus(status);
        return applicationRepository.save(app);
    }
}
