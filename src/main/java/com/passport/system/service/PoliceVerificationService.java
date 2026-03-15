package com.passport.system.service;

import com.passport.system.model.ApplicationStatus;
import com.passport.system.model.PassportApplication;
import com.passport.system.model.PoliceVerification;
import com.passport.system.repository.PoliceVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PoliceVerificationService {

    @Autowired
    private PoliceVerificationRepository policeVerificationRepository;

    @Autowired
    private ApplicationService applicationService;

    public PoliceVerification initiateVerification(Long applicationId, String policeStation) {
        PassportApplication app = applicationService.getApplicationById(applicationId);
        if (app.getStatus() != ApplicationStatus.PAYMENT_CONFIRMED && app.getStatus() != ApplicationStatus.DOCUMENTS_UPLOADED) {
            throw new RuntimeException("Application must be in PAYMENT_CONFIRMED state to initiate police verification.");
        }
        
        PoliceVerification pv = new PoliceVerification();
        pv.setApplication(app);
        pv.setPoliceStation(policeStation);
        pv.setStatus("PENDING");
        pv.setDate(LocalDateTime.now());
        
        PoliceVerification saved = policeVerificationRepository.save(pv);
        applicationService.updateStatus(applicationId, ApplicationStatus.POLICE_VERIFICATION_PENDING);
        
        return saved;
    }

    public PoliceVerification submitReport(Long verificationId, String report) {
        PoliceVerification pv = policeVerificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification record not found"));
        
        pv.setVerificationReport(report);
        pv.setStatus("SUBMITTED");
        PoliceVerification saved = policeVerificationRepository.save(pv);
        
        PassportApplication app = pv.getApplication();
        if ("CLEAR".equalsIgnoreCase(report)) {
            applicationService.updateStatus(app.getApplicationID(), ApplicationStatus.POLICE_VERIFIED);
        } else if ("ADVERSE".equalsIgnoreCase(report)) {
            applicationService.updateStatus(app.getApplicationID(), ApplicationStatus.REJECTED);
        }
        
        return saved;
    }

    public List<PoliceVerification> getPendingVerifications() {
        return policeVerificationRepository.findByStatus("PENDING");
    }
}
