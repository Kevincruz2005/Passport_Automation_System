package com.passport.system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long documentID;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    private PassportApplication application;

    private String documentType; 
    
    private String verificationStatus; // PENDING, VERIFIED, REJECTED
    
    public Long getDocumentID() { return documentID; }
    public void setDocumentID(Long documentID) { this.documentID = documentID; }

    public PassportApplication getApplication() { return application; }
    public void setApplication(PassportApplication application) { this.application = application; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
}
