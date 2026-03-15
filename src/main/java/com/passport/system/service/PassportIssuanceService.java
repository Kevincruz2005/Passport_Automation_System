package com.passport.system.service;

import com.passport.system.model.ApplicationStatus;
import com.passport.system.model.Passport;
import com.passport.system.model.PassportApplication;
import com.passport.system.repository.PassportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
public class PassportIssuanceService {

    @Autowired
    private PassportRepository passportRepository;

    @Autowired
    private ApplicationService applicationService;

    public PassportApplication approveApplication(Long applicationId) {
        PassportApplication app = applicationService.getApplicationById(applicationId);
        if (app.getStatus() != ApplicationStatus.POLICE_VERIFIED) {
            throw new RuntimeException("Application must be POLICE_VERIFIED before approval.");
        }
        return applicationService.updateStatus(applicationId, ApplicationStatus.APPROVED);
    }

    public Passport issuePassport(Long applicationId) {
        PassportApplication app = applicationService.getApplicationById(applicationId);
        if (app.getStatus() != ApplicationStatus.APPROVED) {
            throw new RuntimeException("Application must be APPROVED before issuing a passport.");
        }
        
        Passport passport = new Passport();
        passport.setPassportNumber("IND" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        passport.setApplication(app);
        passport.setIssueDate(LocalDate.now());
        passport.setExpiryDate(LocalDate.now().plusYears(10));
        
        Passport saved = passportRepository.save(passport);
        applicationService.updateStatus(applicationId, ApplicationStatus.PASSPORT_ISSUED);
        
        return saved;
    }

    public Optional<Passport> getPassportByApplication(Long applicationId) {
        return passportRepository.findByApplication_ApplicationID(applicationId);
    }
}
