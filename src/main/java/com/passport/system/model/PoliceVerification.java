package com.passport.system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "police_verifications")
public class PoliceVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long verificationID;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    private PassportApplication application;

    private String policeStation;
    private String verificationReport; // CLEAR, ADVERSE
    private LocalDateTime date;
    private String status; // PENDING, SUBMITTED

    public Long getVerificationID() { return verificationID; }
    public void setVerificationID(Long verificationID) { this.verificationID = verificationID; }

    public PassportApplication getApplication() { return application; }
    public void setApplication(PassportApplication application) { this.application = application; }

    public String getPoliceStation() { return policeStation; }
    public void setPoliceStation(String policeStation) { this.policeStation = policeStation; }

    public String getVerificationReport() { return verificationReport; }
    public void setVerificationReport(String verificationReport) { this.verificationReport = verificationReport; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
